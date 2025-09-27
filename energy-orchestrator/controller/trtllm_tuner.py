import os
import time
import logging
from kubernetes import client, config
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Kubernetes config
try:
    config.load_incluster_config()
except:
    config.load_kube_config()

apps_v1 = client.AppsV1Api()

# Configuration
PROM_URL = os.getenv("PROM_URL", "http://prometheus:9090")
TARGET_NS = os.getenv("TARGET_NS", "default")
APP_LABEL = os.getenv("APP_LABEL", "trtllm-demo")
TARGET_P95_S = float(os.getenv("TARGET_P95_S", "0.2"))  # 200ms
BATCH_MIN = int(os.getenv("BATCH_MIN", "1"))
BATCH_MAX = int(os.getenv("BATCH_MAX", "8"))
CAP_MIN = int(os.getenv("CAP_MIN", "120"))
CAP_MAX = int(os.getenv("CAP_MAX", "300"))

def query_prometheus(query):
    """Query Prometheus for metrics"""
    try:
        response = requests.get(
            f"{PROM_URL}/api/v1/query",
            params={"query": query}
        )
        data = response.json()
        if data["status"] == "success" and data["data"]["result"]:
            return float(data["data"]["result"][0]["value"][1])
    except Exception as e:
        logger.error(f"Prometheus query failed: {e}")
    return None

def get_current_config():
    """Get current batch hint and power cap from deployment"""
    try:
        deployment = apps_v1.read_namespaced_deployment(APP_LABEL, TARGET_NS)
        
        # Get batch hint
        batch_hint = BATCH_MIN
        for container in deployment.spec.template.spec.containers:
            if container.env:
                for env in container.env:
                    if env.name == "ENERGY_BATCH_HINT":
                        batch_hint = int(env.value)
                        break
        
        # Get power cap
        power_cap = CAP_MIN
        annotations = deployment.spec.template.metadata.annotations or {}
        if "energy.yourorg.io/gpu-power-cap-w" in annotations:
            power_cap = int(annotations["energy.yourorg.io/gpu-power-cap-w"])
        
        return batch_hint, power_cap
    except Exception as e:
        logger.error(f"Failed to get current config: {e}")
        return BATCH_MIN, CAP_MIN

def apply_config(batch_hint, power_cap):
    """Apply new batch hint and power cap to deployment"""
    try:
        deployment = apps_v1.read_namespaced_deployment(APP_LABEL, TARGET_NS)
        
        # Update batch hint
        for container in deployment.spec.template.spec.containers:
            if container.env:
                for env in container.env:
                    if env.name == "ENERGY_BATCH_HINT":
                        env.value = str(batch_hint)
                        break
        
        # Update power cap annotation
        if not deployment.spec.template.metadata.annotations:
            deployment.spec.template.metadata.annotations = {}
        deployment.spec.template.metadata.annotations["energy.yourorg.io/gpu-power-cap-w"] = str(power_cap)
        
        # Apply changes
        apps_v1.patch_namespaced_deployment(
            APP_LABEL,
            TARGET_NS,
            deployment
        )
        logger.info(f"Applied config: batch={batch_hint}, cap={power_cap}W")
        return True
    except Exception as e:
        logger.error(f"Failed to apply config: {e}")
        return False

def optimize_frontier():
    """Find optimal point on energy-latency frontier"""
    
    # Get current metrics
    p95_query = f'energy:app_p95_latency_seconds{{app="{APP_LABEL}"}} or on() vector(0)'
    jpr_query = f'energy:app_joules_per_request{{app="{APP_LABEL}"}} or on() vector(0)'
    
    p95 = query_prometheus(p95_query)
    jpr = query_prometheus(jpr_query)
    
    if p95 is None or jpr is None:
        logger.warning("No metrics available, skipping optimization")
        return
    
    current_batch, current_cap = get_current_config()
    
    logger.info(f"Current state: P95={p95:.3f}s, J/req={jpr:.1f}, batch={current_batch}, cap={current_cap}W")
    
    # Simple greedy optimization
    new_batch = current_batch
    new_cap = current_cap
    
    if p95 > TARGET_P95_S:
        # Latency too high - reduce batch or increase power
        if current_batch > BATCH_MIN:
            new_batch = current_batch - 1
        elif current_cap < CAP_MAX:
            new_cap = min(CAP_MAX, current_cap + 20)
    else:
        # Latency OK - try to save energy
        if jpr > 150 and current_cap > CAP_MIN:
            # High energy - reduce power cap
            new_cap = max(CAP_MIN, current_cap - 10)
        elif p95 < TARGET_P95_S * 0.8 and current_batch < BATCH_MAX:
            # Lots of headroom - increase batch
            new_batch = current_batch + 1
    
    # Apply if changed
    if new_batch != current_batch or new_cap != current_cap:
        logger.info(f"Optimizing: batch {current_batch}->{new_batch}, cap {current_cap}->{new_cap}W")
        apply_config(new_batch, new_cap)

def main():
    logger.info(f"TensorRT-LLM Tuner started")
    logger.info(f"Target: P95<{TARGET_P95_S}s, minimize J/req")
    logger.info(f"Bounds: batch=[{BATCH_MIN},{BATCH_MAX}], cap=[{CAP_MIN},{CAP_MAX}]W")
    
    while True:
        try:
            optimize_frontier()
        except Exception as e:
            logger.error(f"Optimization loop error: {e}")
        
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main()
