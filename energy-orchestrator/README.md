# Energy Orchestrator

A Kubernetes-native stack to reduce data-center IT energy by 15–30% via **power caps, adaptive batching, energy-aware autoscaling**, and **DVFS**—all while protecting latency SLOs.

## 🎯 Target Metrics
- **Energy Reduction**: 15-30% kWh reduction
- **Joules/Request**: 20% improvement
- **Idle Energy**: 30% reduction
- **PUE**: -0.05 improvement
- **SLA Protection**: <5% latency impact

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Energy Orchestrator                       │
├───────────────┬────────────────┬────────────────────────────┤
│   Monitoring  │   Control       │   Optimization            │
├───────────────┼────────────────┼────────────────────────────┤
│ • Agent       │ • Controller    │ • vLLM/TensorRT Shims     │
│ • Prometheus  │ • Energy API    │ • Batch Optimization      │
│ • Grafana     │ • PID Control   │ • Power Cap Management    │
│ • DCGM        │ • KEDA Scaling  │ • Quantization (INT8/FP8) │
└───────────────┴────────────────┴────────────────────────────┘
```

## 🚀 Quick Start

```bash
# 1. Build container images
make build REG=ghcr.io/yourorg/energy-orchestrator TAG=v0.5.0

# 2. Create development cluster
make kind-up

# 3. Deploy full stack (includes Prometheus, Grafana, KEDA)
make deploy

# 4. Apply energy policies
kubectl apply -f policies/

# 5. Deploy optimized workloads
kubectl apply -f examples/vllm-autoscale-batch-demo.yaml
kubectl apply -f examples/trtllm-with-keda.yaml

# 6. View dashboards
kubectl -n energy-system port-forward svc/energy-monitoring-grafana 3000:80
# Login: admin/prom-operator
```

## 📊 Components

### Core Services
- **Agent**: Node daemon exporting power/thermal metrics (RAPL, nvidia-smi, Redfish)
- **Energy API**: FastAPI service computing KPIs (J/request) and control recommendations
- **Controller**: Kubernetes Operator enforcing energy policies via CRDs
- **Notifier**: Slack/webhook reporter for energy violations and top offenders

### Monitoring Stack
- **Prometheus**: Metrics collection with custom recording rules
- **Grafana**: Energy Efficiency Dashboard with real-time visualization
- **Alertmanager**: SLA breach and thermal alerts with Slack integration
- **KEDA**: HPA on custom metrics (Joules/request)

### Optimization Features
- **GPU Power Capping**: Dynamic nvidia-smi power limits
- **Adaptive Batching**: PID-controlled batch sizing for latency targets
- **Energy-Aware Scheduling**: Bin-packing and idle node consolidation
- **Quantization**: INT8/FP8 for inference optimization
- **Speculative Decoding**: LLM serving optimization
- **Carbon-Aware Scheduling**: Shift workloads to low-carbon windows

## 📈 Metrics & KPIs

| Metric | Formula | Target |
|--------|---------|--------|
| Joules/Request | (Power_W × Interval_s) / Requests | -20% |
| Idle Energy Rate | Power_W when QPS ≈ 0 | -30% |
| GPU Utilization | SM Activity % | >80% |
| PUE | Total Power / IT Power | <1.2 |
| P95 Latency | 95th percentile response time | <SLO |

## 🛡️ Safety Features
- Hard TDP/temperature boundaries
- Automatic revert on stale metrics
- SLA breach protection
- Fail-safe to default autoscaling
- Thermal throttle prevention

## 📝 Configuration

### Energy Policy CRD
```yaml
apiVersion: energy.io/v1alpha1
kind: EnergyPolicy
metadata:
  name: inference-optimization
spec:
  targetNamespace: inference
  powerCaps:
    gpu: 250  # Watts
    cpu: 150  # Watts
  sla:
    p95LatencyMs: 200
    errorRatePercent: 0.1
  autoscaling:
    targetJoulesPerRequest: 150
    minReplicas: 2
    maxReplicas: 10
```

## 🔧 Advanced Configuration

### PID Controller Tuning
```bash
# Controller environment variables
PID_KP=2.0          # Proportional gain
PID_KI=0.2          # Integral gain
PID_KD=0.1          # Derivative gain
BATCH_MIN=1         # Minimum batch size
BATCH_MAX=8         # Maximum batch size
GPU_POWER_FLOOR=120 # Minimum GPU power (W)
GPU_POWER_CEIL=300  # Maximum GPU power (W)
```

### Alert Configuration
```yaml
alerts:
  targetJoulesPerReq: 200
  slack:
    webhookUrl: "https://hooks.slack.com/services/XXX/YYY/ZZZ"
    channel: "#energy-alerts"
  webhook:
    url: "https://example.com/webhook"
```

## 📚 Documentation
- [Architecture Guide](docs/architecture.md)
- [Deployment Guide](docs/deployment.md)
- [Policy Reference](docs/policies.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Performance Tuning](docs/tuning.md)

## 🤝 Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License
Apache 2.0 - See [LICENSE](LICENSE) for details.
