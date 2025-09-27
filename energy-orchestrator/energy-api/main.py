from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from typing import Dict, List, Optional
import httpx
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import asyncio
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Energy Orchestrator API", version="0.5.0")

# Prometheus metrics
request_counter = Counter('energy_api_requests_total', 'Total API requests')
latency_histogram = Histogram('energy_api_latency_seconds', 'API latency')
joules_per_request = Gauge('energy_joules_per_request', 'Joules per request', ['service'])
cluster_power = Gauge('energy_cluster_power_watts', 'Total cluster power')
optimization_score = Gauge('energy_optimization_score', 'Optimization effectiveness (0-100)')

# Configuration
PROM_URL = os.getenv("PROM_URL", "http://localhost:9090")
ENERGY_THRESHOLD = float(os.getenv("ENERGY_THRESHOLD", "200"))  # J/req

class EnergyMetrics(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    cluster_power_w: float
    gpu_power_w: float
    cpu_power_w: float
    requests_per_second: float
    joules_per_request: float
    gpu_utilization: float
    idle_percentage: float

class OptimizationRecommendation(BaseModel):
    service: str
    current_power_cap: Optional[int] = None
    recommended_power_cap: int
    current_batch_size: Optional[int] = None
    recommended_batch_size: int
    current_replicas: Optional[int] = None
    recommended_replicas: int
    estimated_savings_percent: float
    confidence: float

class PolicyUpdate(BaseModel):
    namespace: str
    deployments: List[str]
    power_caps: Dict[str, int]
    batch_hints: Dict[str, int]
    scaling_targets: Dict[str, int]

# In-memory state for analysis
metrics_buffer = []
optimization_history = {}

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

async def collect_cluster_metrics() -> EnergyMetrics:
    """Collect current cluster energy metrics"""
    
    # Query various metrics from Prometheus
    queries = {
        "cluster_power": "sum(node_total_power_watts)",
        "gpu_power": "sum(node_gpu_power_watts)",
        "cpu_power": "sum(node_cpu_power_watts)",
        "requests": "sum(rate(app_requests_total[1m]))",
        "gpu_util": "avg(node_gpu_utilization_percent)",
        "idle_nodes": 'count(node_total_power_watts < 100)'
    }
    
    results = {}
    for name, query in queries.items():
        results[name] = await query_prometheus(query)
    
    # Calculate derived metrics
    rps = results["requests"]
    total_power = results["cluster_power"] or (results["gpu_power"] + results["cpu_power"])
    
    if rps > 0:
        j_per_req = total_power / rps
    else:
        j_per_req = total_power  # All energy is "waste" when idle
    
    total_nodes = await query_prometheus("count(node_total_power_watts)")
    idle_pct = (results["idle_nodes"] / max(total_nodes, 1)) * 100
    
    metrics = EnergyMetrics(
        cluster_power_w=total_power,
        gpu_power_w=results["gpu_power"],
        cpu_power_w=results["cpu_power"],
        requests_per_second=rps,
        joules_per_request=j_per_req,
        gpu_utilization=results["gpu_util"],
        idle_percentage=idle_pct
    )
    
    # Update Prometheus metrics
    cluster_power.set(total_power)
    if rps > 0:
        joules_per_request.labels(service="cluster").set(j_per_req)
    
    return metrics

def calculate_optimization(metrics: EnergyMetrics, service: str = "default") -> OptimizationRecommendation:
    """Calculate optimization recommendations based on current metrics"""
    
    # Simple heuristic-based optimization
    # In production, this would use ML models trained on historical data
    
    rec = OptimizationRecommendation(
        service=service,
        current_power_cap=250,
        recommended_power_cap=250,
        current_batch_size=4,
        recommended_batch_size=4,
        current_replicas=3,
        recommended_replicas=3,
        estimated_savings_percent=0,
        confidence=0.5
    )
    
    # Power cap optimization
    if metrics.gpu_utilization < 60:
        # Underutilized - reduce power cap
        rec.recommended_power_cap = 200
        rec.estimated_savings_percent += 10
    elif metrics.gpu_utilization > 85:
        # High utilization - might need more power
        rec.recommended_power_cap = 280
    
    # Batch size optimization
    if metrics.joules_per_request > ENERGY_THRESHOLD:
        # Too much energy per request - increase batching
        rec.recommended_batch_size = min(8, rec.current_batch_size + 2)
        rec.estimated_savings_percent += 5
    elif metrics.joules_per_request < ENERGY_THRESHOLD * 0.5:
        # Very efficient - can reduce batching for better latency
        rec.recommended_batch_size = max(1, rec.current_batch_size - 1)
    
    # Replica optimization
    if metrics.idle_percentage > 30:
        # Too many idle resources
        rec.recommended_replicas = max(1, rec.current_replicas - 1)
        rec.estimated_savings_percent += 8
    elif metrics.requests_per_second > 100 and metrics.gpu_utilization > 80:
        # High load - scale up
        rec.recommended_replicas = rec.current_replicas + 1
    
    rec.confidence = min(0.9, 0.5 + len(metrics_buffer) * 0.01)
    
    return rec

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "healthy", "service": "energy-api", "version": "0.5.0"}

@app.get("/metrics/current", response_model=EnergyMetrics)
async def get_current_metrics():
    """Get current cluster energy metrics"""
    request_counter.inc()
    metrics = await collect_cluster_metrics()
    
    # Buffer for historical analysis
    metrics_buffer.append(metrics)
    if len(metrics_buffer) > 1000:
        metrics_buffer.pop(0)
    
    return metrics

@app.get("/optimize/{namespace}", response_model=List[OptimizationRecommendation])
async def get_optimization_recommendations(namespace: str):
    """Get optimization recommendations for a namespace"""
    request_counter.inc()
    
    # Get current metrics
    metrics = await collect_cluster_metrics()
    
    # Query for services in namespace
    services_query = f'count by (deployment) (kube_deployment_labels{{namespace="{namespace}"}})'
    # For demo, return recommendations for common services
    services = ["inference-svc", "training-job", "batch-processor"]
    
    recommendations = []
    for service in services:
        rec = calculate_optimization(metrics, service)
        recommendations.append(rec)
        
        # Track optimization score
        optimization_score.set(100 - rec.estimated_savings_percent)
    
    return recommendations

@app.post("/policy/apply")
async def apply_policy(policy: PolicyUpdate):
    """Apply energy optimization policy"""
    request_counter.inc()
    
    # Log policy application
    logger.info(f"Applying policy to namespace {policy.namespace}")
    logger.info(f"Power caps: {policy.power_caps}")
    logger.info(f"Batch hints: {policy.batch_hints}")
    logger.info(f"Scaling targets: {policy.scaling_targets}")
    
    # In production, this would update Kubernetes resources
    # For now, track in optimization history
    optimization_history[policy.namespace] = {
        "timestamp": datetime.utcnow(),
        "policy": policy.dict()
    }
    
    return {"status": "applied", "namespace": policy.namespace}

@app.get("/analysis/trends")
async def get_energy_trends():
    """Get energy consumption trends"""
    if not metrics_buffer:
        return {"error": "No data available"}
    
    df = pd.DataFrame([m.dict() for m in metrics_buffer])
    
    trends = {
        "avg_power_w": df["cluster_power_w"].mean(),
        "peak_power_w": df["cluster_power_w"].max(),
        "avg_joules_per_request": df["joules_per_request"].mean(),
        "power_trend": "increasing" if df["cluster_power_w"].iloc[-10:].mean() > df["cluster_power_w"].iloc[:10].mean() else "decreasing",
        "efficiency_trend": "improving" if df["joules_per_request"].iloc[-10:].mean() < df["joules_per_request"].iloc[:10].mean() else "degrading",
        "samples": len(df)
    }
    
    return trends

@app.get("/prometheus/metrics")
async def prometheus_metrics():
    """Expose Prometheus metrics"""
    return generate_latest()

# Background task to continuously collect metrics
async def metrics_collector():
    """Background task to collect metrics periodically"""
    while True:
        try:
            await collect_cluster_metrics()
        except Exception as e:
            logger.error(f"Metrics collection failed: {e}")
        await asyncio.sleep(30)

@app.on_event("startup")
async def startup_event():
    """Start background tasks on startup"""
    asyncio.create_task(metrics_collector())
    logger.info("Energy API started - collecting metrics every 30s")
