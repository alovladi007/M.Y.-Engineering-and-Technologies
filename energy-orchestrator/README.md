# Energy Orchestrator v0.7.0

A comprehensive Kubernetes-native energy optimization system achieving 15-30% energy reduction while maintaining SLAs.

## 🌟 Features

### Core Optimization
- **Dynamic Power Management**: GPU/CPU power capping with PID control
- **Adaptive Batching**: Automatic batch size optimization for latency targets
- **Energy-Aware Autoscaling**: KEDA-based scaling on Joules/request metrics
- **Idle Consolidation**: Automatic detection and consolidation of idle resources

### Advanced Features
- **Per-App Energy Targets**: Individual application energy budgets with KEDA
- **Green Window Scheduling**: Carbon-aware workload scheduling
- **Closed-Loop TRT-LLM Tuning**: Automatic optimization of TensorRT-LLM parameters
- **Grafana Snapshot Automation**: Daily dashboard snapshots for historical tracking
- **PDF Energy Reports**: Baseline vs treatment analysis with savings metrics

### Monitoring & Observability
- **Prometheus Integration**: Custom recording rules and alerts
- **Grafana Dashboards**: Real-time energy efficiency visualization
- **Slack/Webhook Alerts**: Immediate notification of SLA breaches
- **Per-App Metrics**: Detailed energy consumption per application

## 📊 Target Metrics

| Metric | Target | Method |
|--------|--------|--------|
| Energy Reduction | 15-30% | Power capping, batching, consolidation |
| Joules/Request | -20% | Optimization algorithms |
| Idle Energy | -30% | Aggressive consolidation |
| P95 Latency | <SLO | PID control, dynamic adjustment |
| GPU Utilization | >80% | Smart scheduling |

## 🚀 Quick Start

### Prerequisites
- Kubernetes 1.24+
- Helm 3.0+
- Docker or container runtime
- NVIDIA GPU Operator (for GPU nodes)

### One-Command Deployment
```bash
# Clone repository
git clone https://github.com/yourorg/energy-orchestrator
cd energy-orchestrator

# Deploy everything
./deploy-all.sh
```

### Manual Deployment
```bash
# 1. Build images
make build REG=ghcr.io/yourorg/energy-orchestrator TAG=v0.7.0

# 2. Push to registry
make push REG=ghcr.io/yourorg/energy-orchestrator TAG=v0.7.0

# 3. Deploy stack
make deploy

# 4. Apply policies
kubectl apply -f policies/

# 5. Deploy examples
kubectl apply -f examples/
```

## 🔧 Configuration

### Key Configuration Files

#### values.yaml
```yaml
# Core settings
alerts:
  targetJoulesPerReq: 200  # J/request target

# Green windows (UTC)
greenWindow:
  windows: "00:00-06:00,22:00-24:00"
  powerRelaxPercent: 5

# TRT-LLM tuning
trtllmTuner:
  targetP95Seconds: 0.2
  batchMin: 1
  batchMax: 8
```

#### Energy Policy CRD
```yaml
apiVersion: energy.io/v1alpha1
kind: EnergyPolicy
metadata:
  name: inference-optimization
spec:
  targetNamespace: default
  powerCaps:
    gpu: 250
  sla:
    p95LatencyMs: 200
  autoscaling:
    targetJoulesPerRequest: 150
```

## 📈 Monitoring

### Access Dashboards
```bash
# Grafana (admin/prom-operator)
kubectl -n energy-system port-forward svc/energy-grafana 3000:80

# Prometheus
kubectl -n energy-system port-forward svc/energy-kube-prometheus-prometheus 9090:9090
```

### Key Metrics
- `energy:cluster_joules_per_request` - Cluster-wide efficiency
- `energy:app_joules_per_request` - Per-app energy consumption
- `energy:app_p95_latency_seconds` - Application latency
- `node_gpu_power_watts` - GPU power consumption
- `node_gpu_temperature_celsius` - GPU temperature

## 📄 Generate Reports

### Energy Savings Report
```bash
# Configure time periods in values.yaml
# Then generate report
kubectl -n energy-system create job --from=job/energy-report-generator manual-report

# Wait for completion
kubectl -n energy-system wait --for=condition=complete job/manual-report

# Extract PDF
POD=$(kubectl -n energy-system get pods -l job-name=manual-report -o jsonpath='{.items[0].metadata.name}')
kubectl cp energy-system/$POD:/out/energy-report.pdf ./energy-report.pdf
```

## 🎯 Implementation Timeline

### Phase 1: Days 0-30 (MVP)
- ✅ Deploy monitoring stack
- ✅ Implement basic power capping
- ✅ Enable adaptive batching
- **Target**: 10-15% reduction

### Phase 2: Days 31-60 (Optimization)
- ✅ Deploy PID controller
- ✅ Enable per-app targets
- ✅ Implement green windows
- **Target**: 15-25% reduction

### Phase 3: Days 61-90 (Advanced)
- ✅ Closed-loop tuning
- ✅ Automated reporting
- ⏳ ML-based optimization
- **Target**: 20-30%+ reduction

## 🛠️ Troubleshooting

### Common Issues

#### High Latency After Optimization
```bash
# Reduce PID gains
kubectl -n energy-system edit configmap energy-controller-config
# Decrease kp, ki values
```

#### Insufficient Energy Savings
```bash
# Enable more aggressive settings
helm upgrade energy ./infra/charts/energy \
  --set optimization.mode=aggressive \
  --set optimization.powerLimits.gpuFloor=100
```

#### Pods Not Scaling
```bash
# Check KEDA metrics
kubectl get scaledobject -A
kubectl describe scaledobject vllm-energy-scaler
```

## 📚 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Control Plane                          │
├─────────────┬─────────────┬─────────────────────────────┤
│ Controller  │ Energy API  │ Notifier                    │
│ (PID Loop)  │ (KPIs)      │ (Alerts)                    │
└─────────────┴─────────────┴─────────────────────────────┘
        │              │                │
┌───────▼──────────────▼────────────────▼─────────────────┐
│                   Data Plane                             │
├─────────────┬─────────────┬─────────────────────────────┤
│ Agent       │ Prometheus  │ Grafana                     │
│ (Metrics)   │ (Storage)   │ (Visualization)             │
└─────────────┴─────────────┴─────────────────────────────┘
        │              │                │
┌───────▼──────────────▼────────────────▼─────────────────┐
│                   Workloads                              │
├─────────────┬─────────────┬─────────────────────────────┤
│ vLLM        │ TensorRT    │ Training Jobs               │
│ (Inference) │ (Optimized) │ (Batch)                     │
└─────────────┴─────────────┴─────────────────────────────┘
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- NVIDIA for DCGM and GPU metrics
- Prometheus community for monitoring stack
- KEDA for autoscaling capabilities
- vLLM and TensorRT-LLM teams

---
**Energy Orchestrator v0.7.0** - Reducing data center energy consumption without compromising performance.