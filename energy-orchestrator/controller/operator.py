import kopf
import kubernetes
import logging
import os
import httpx
import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from kubernetes import client, config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Kubernetes config
try:
    config.load_incluster_config()
except:
    config.load_kube_config()

# Kubernetes clients
v1 = client.CoreV1Api()
apps_v1 = client.AppsV1Api()
custom_api = client.CustomObjectsApi()

# Configuration
PROM_URL = os.getenv("PROM_URL", "http://energy-monitoring-kube-prometheus-prometheus.energy-system.svc.cluster.local:9090")
ENERGY_API_URL = os.getenv("ENERGY_API_URL", "http://energy-api.energy-system.svc.cluster.local:8000")
JOULES_PER_REQ_THRESHOLD = float(os.getenv("JOULES_PER_REQ_THRESHOLD", "200"))

# PID Controller parameters
PID_KP = float(os.getenv("PID_KP", "2.0"))
PID_KI = float(os.getenv("PID_KI", "0.2"))
PID_KD = float(os.getenv("PID_KD", "0.1"))
BATCH_MIN = int(os.getenv("BATCH_MIN", "1"))
BATCH_MAX = int(os.getenv("BATCH_MAX", "8"))
GPU_POWER_FLOOR = int(os.getenv("GPU_POWER_FLOOR", "120"))
GPU_POWER_CEIL = int(os.getenv("GPU_POWER_CEIL", "300"))

# PID Controller state
pid_state = {}

class PIDController:
    """PID controller for batch size optimization"""
    
    def __init__(self, kp, ki, kd, setpoint):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.setpoint = setpoint
        self.integral = 0
        self.last_error = 0
        
    def update(self, current_value, dt=1.0):
        """Calculate PID output"""
        error = self.setpoint - current_value
        self.integral += error * dt
        derivative = (error - self.last_error) / dt
        
        output = self.kp * error + self.ki * self.integral + self.kd * derivative
        self.last_error = error
        
        return output

async def query_prometheus(query: str) -> float:
    """Query Prometheus for metrics"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PROM_URL}/api/v1/query",
                params={"query": query}
            )
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "success" and data["data"]["result"]:
                return float(data["data"]["result"][0]["value"][1])
            return 0.0
    except Exception as e:
        logger.error(f"Prometheus query failed: {e}")
        return 0.0

async def get_optimization_recommendations(namespace: str) -> list:
    """Get optimization recommendations from Energy API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ENERGY_API_URL}/optimize/{namespace}")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        return []

def apply_power_cap(deployment_name: str, namespace: str, power_cap: int):
    """Apply GPU power cap to deployment pods"""
    try:
        # Get pods for deployment
        pods = v1.list_namespaced_pod(
            namespace=namespace,
            label_selector=f"app={deployment_name}"
        )
        
        for pod in pods.items:
            # Annotate pod with power cap
            body = {
                "metadata": {
                    "annotations": {
                        "energy.yourorg.io/gpu-power-cap-w": str(power_cap)
                    }
                }
            }
            v1.patch_namespaced_pod(
                name=pod.metadata.name,
                namespace=namespace,
                body=body
            )
            logger.info(f"Applied power cap {power_cap}W to pod {pod.metadata.name}")
            
    except Exception as e:
        logger.error(f"Failed to apply power cap: {e}")

def update_batch_hint(deployment_name: str, namespace: str, batch_size: int):
    """Update batch hint environment variable in deployment"""
    try:
        # Get deployment
        deployment = apps_v1.read_namespaced_deployment(
            name=deployment_name,
            namespace=namespace
        )
        
        # Update environment variable
        for container in deployment.spec.template.spec.containers:
            if not container.env:
                container.env = []
            
            # Update or add ENERGY_BATCH_HINT
            env_updated = False
            for env in container.env:
                if env.name == "ENERGY_BATCH_HINT":
                    env.value = str(batch_size)
                    env_updated = True
                    break
            
            if not env_updated:
                container.env.append(
                    client.V1EnvVar(name="ENERGY_BATCH_HINT", value=str(batch_size))
                )
        
        # Apply update
        apps_v1.patch_namespaced_deployment(
            name=deployment_name,
            namespace=namespace,
            body=deployment
        )
        logger.info(f"Updated batch hint to {batch_size} for {deployment_name}")
        
    except Exception as e:
        logger.error(f"Failed to update batch hint: {e}")

async def optimize_deployment_with_pid(deployment_name: str, namespace: str, target_p95_ms: float):
    """Use PID controller to optimize batch size for P95 latency target"""
    
    # Initialize PID controller for this deployment if not exists
    if deployment_name not in pid_state:
        pid_state[deployment_name] = PIDController(
            kp=PID_KP,
            ki=PID_KI,
            kd=PID_KD,
            setpoint=target_p95_ms
        )
    
    pid = pid_state[deployment_name]
    
    # Get current P95 latency
    query = f'histogram_quantile(0.95, sum(rate(app_request_duration_seconds_bucket{{app="{deployment_name}"}}[5m])) by (le)) * 1000'
    current_p95 = await query_prometheus(query)
    
    if current_p95 == 0:
        logger.warning(f"No P95 data for {deployment_name}, skipping optimization")
        return
    
    # Calculate PID output
    adjustment = pid.update(current_p95)
    
    # Get current batch hint
    try:
        deployment = apps_v1.read_namespaced_deployment(
            name=deployment_name,
            namespace=namespace
        )
        current_batch = BATCH_MIN
        for container in deployment.spec.template.spec.containers:
            if container.env:
                for env in container.env:
                    if env.name == "ENERGY_BATCH_HINT":
                        current_batch = int(env.value)
                        break
    except:
        current_batch = BATCH_MIN
    
    # Apply adjustment with bounds
    new_batch = current_batch
    if adjustment > 0:  # P95 too low, can increase batch
        new_batch = min(BATCH_MAX, current_batch + 1)
    elif adjustment < -1:  # P95 too high, decrease batch
        new_batch = max(BATCH_MIN, current_batch - 1)
    
    # Apply if changed
    if new_batch != current_batch:
        update_batch_hint(deployment_name, namespace, new_batch)
        logger.info(f"PID adjusted batch for {deployment_name}: {current_batch} -> {new_batch} (P95: {current_p95:.1f}ms, target: {target_p95_ms}ms)")
    
    # Check cluster J/req and adjust power caps
    cluster_jpr = await query_prometheus("energy:cluster_joules_per_request")
    if cluster_jpr > JOULES_PER_REQ_THRESHOLD:
        # Tighten power caps
        new_cap = max(GPU_POWER_FLOOR, GPU_POWER_CEIL - 30)
        apply_power_cap(deployment_name, namespace, new_cap)
        logger.info(f"Tightened power cap to {new_cap}W due to high J/req: {cluster_jpr:.1f}")
    elif cluster_jpr < JOULES_PER_REQ_THRESHOLD * 0.7:
        # Relax power caps
        new_cap = min(GPU_POWER_CEIL, GPU_POWER_FLOOR + 50)
        apply_power_cap(deployment_name, namespace, new_cap)
        logger.info(f"Relaxed power cap to {new_cap}W due to low J/req: {cluster_jpr:.1f}")

@kopf.on.create('energy.io', 'v1alpha1', 'energypolicies')
@kopf.on.update('energy.io', 'v1alpha1', 'energypolicies')
async def handle_energy_policy(spec, name, namespace, **kwargs):
    """Handle EnergyPolicy resource creation/updates"""
    
    logger.info(f"Processing EnergyPolicy {name} in namespace {namespace}")
    
    target_namespace = spec.get('targetNamespace', namespace)
    power_caps = spec.get('powerCaps', {})
    sla = spec.get('sla', {})
    autoscaling = spec.get('autoscaling', {})
    
    # Apply power caps
    if 'gpu' in power_caps:
        gpu_cap = power_caps['gpu']
        
        # Get all deployments in target namespace
        deployments = apps_v1.list_namespaced_deployment(namespace=target_namespace)
        for deployment in deployments.items:
            apply_power_cap(deployment.metadata.name, target_namespace, gpu_cap)
    
    # Set up PID optimization for deployments
    if 'p95LatencyMs' in sla:
        target_p95 = sla['p95LatencyMs']
        
        deployments = apps_v1.list_namespaced_deployment(namespace=target_namespace)
        for deployment in deployments.items:
            await optimize_deployment_with_pid(
                deployment.metadata.name,
                target_namespace,
                target_p95
            )
    
    # Get optimization recommendations
    recommendations = await get_optimization_recommendations(target_namespace)
    
    # Apply recommendations
    for rec in recommendations:
        if rec['confidence'] > 0.7:
            update_batch_hint(rec['service'], target_namespace, rec['recommended_batch_size'])
            apply_power_cap(rec['service'], target_namespace, rec['recommended_power_cap'])
    
    return {"status": "applied", "recommendationsApplied": len(recommendations)}

@kopf.on.delete('energy.io', 'v1alpha1', 'energypolicies')
async def handle_energy_policy_deletion(spec, name, namespace, **kwargs):
    """Handle EnergyPolicy deletion"""
    
    logger.info(f"Deleting EnergyPolicy {name} from namespace {namespace}")
    
    target_namespace = spec.get('targetNamespace', namespace)
    
    # Reset to default power caps
    deployments = apps_v1.list_namespaced_deployment(namespace=target_namespace)
    for deployment in deployments.items:
        apply_power_cap(deployment.metadata.name, target_namespace, 250)  # Default
        update_batch_hint(deployment.metadata.name, target_namespace, 4)  # Default
    
    # Clean up PID state
    for deployment in deployments.items:
        if deployment.metadata.name in pid_state:
            del pid_state[deployment.metadata.name]
    
    return {"status": "deleted"}

@kopf.timer('energy.io', 'v1alpha1', 'energypolicies', interval=60)
async def periodic_optimization(spec, name, namespace, **kwargs):
    """Periodic optimization loop"""
    
    target_namespace = spec.get('targetNamespace', namespace)
    sla = spec.get('sla', {})
    
    # Run PID optimization for all deployments
    if 'p95LatencyMs' in sla:
        target_p95 = sla['p95LatencyMs']
        
        deployments = apps_v1.list_namespaced_deployment(namespace=target_namespace)
        for deployment in deployments.items:
            await optimize_deployment_with_pid(
                deployment.metadata.name,
                target_namespace,
                target_p95
            )
    
    # Check for idle consolidation opportunities
    idle_query = "count(node_gpu_utilization_percent < 10)"
    idle_nodes = await query_prometheus(idle_query)
    
    if idle_nodes > 2:
        logger.info(f"Found {idle_nodes} idle nodes - recommending consolidation")
        # In production, would trigger node draining and consolidation
    
    return {"status": "optimized"}

@kopf.on.startup()
async def startup_handler(logger, **kwargs):
    """Initialize controller on startup"""
    logger.info("Energy Controller starting up...")
    logger.info(f"Configuration:")
    logger.info(f"  PROM_URL: {PROM_URL}")
    logger.info(f"  ENERGY_API_URL: {ENERGY_API_URL}")
    logger.info(f"  J/req threshold: {JOULES_PER_REQ_THRESHOLD}")
    logger.info(f"  PID gains: Kp={PID_KP}, Ki={PID_KI}, Kd={PID_KD}")
    logger.info(f"  Batch range: {BATCH_MIN}-{BATCH_MAX}")
    logger.info(f"  Power range: {GPU_POWER_FLOOR}W-{GPU_POWER_CEIL}W")

if __name__ == "__main__":
    kopf.run()
