# Energy Orchestrator Architecture

## Overview

The Energy Orchestrator is a Kubernetes-native system designed to reduce data center energy consumption by 15-30% through intelligent resource management, adaptive batching, and power-aware scheduling.

## System Components

### 1. Agent (Node Daemon)

**Purpose**: Collects real-time power and thermal metrics from each Kubernetes node.

**Key Features**:
- Intel RAPL (Running Average Power Limit) monitoring
- NVIDIA GPU metrics via nvidia-smi
- Node-level power consumption tracking
- Prometheus metrics export

**Deployment**: DaemonSet on all nodes

**Metrics Exported**:
- `node_cpu_power_watts` - CPU power consumption
- `node_gpu_power_watts` - GPU power consumption
- `node_gpu_temperature_celsius` - GPU temperature
- `node_gpu_utilization_percent` - GPU utilization
- `node_total_power_watts` - Total node power

### 2. Energy API

**Purpose**: Central service that computes energy KPIs and provides optimization recommendations.

**Key Features**:
- Real-time energy metrics calculation
- Joules-per-request computation
- Optimization algorithm execution
- Policy enforcement recommendations
- Historical trend analysis

**API Endpoints**:
- `GET /metrics/current` - Current cluster energy metrics
- `GET /optimize/{namespace}` - Optimization recommendations
- `POST /policy/apply` - Apply energy policies
- `GET /analysis/trends` - Energy consumption trends

### 3. Controller (Kubernetes Operator)

**Purpose**: Enforces energy policies and implements real-time optimizations.

**Key Features**:
- EnergyPolicy CRD management
- PID controller for batch size optimization
- Dynamic power cap adjustment
- KEDA integration for energy-aware autoscaling
- SLA protection mechanisms

**Control Loops**:
- **Power Cap Control**: Adjusts GPU power limits based on efficiency
- **Batch Size Control**: PID-controlled batching for latency targets
- **Replica Control**: Energy-aware horizontal pod autoscaling
- **Consolidation Control**: Idle node detection and workload consolidation

### 4. Serving Plugins

#### vLLM Energy Shim
- Integrates with vLLM inference engine
- Dynamic batch size adjustment
- Power cap management
- Energy metrics collection

#### TensorRT-LLM Energy Shim
- Integrates with TensorRT-LLM inference engine
- Quantization optimization (INT8/FP8)
- Speculative decoding support
- Energy-aware model serving

### 5. Monitoring Stack

#### Prometheus
- Metrics collection and storage
- Custom recording rules for energy KPIs
- Alerting rules for SLA breaches

#### Grafana
- Energy efficiency dashboards
- Real-time visualization
- Historical trend analysis
- Custom energy KPIs

#### KEDA
- Energy-aware autoscaling
- Custom metrics (Joules/request)
- Multi-metric scaling policies

## Data Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    Agent    │───▶│  Prometheus  │───▶│   Grafana   │
│ (Node Daemon)│    │  (Metrics)   │    │ (Dashboard) │
└─────────────┘    └──────────────┘    └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Energy API  │◀───│  Controller  │───▶│  Workloads  │
│ (Analysis)  │    │ (Enforcement)│    │ (Optimized) │
└─────────────┘    └──────────────┘    └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐    ┌──────────────┐
│  Policies   │    │   Serving    │
│ (CRDs)      │    │  Plugins     │
└─────────────┘    └──────────────┘
```

## Optimization Algorithms

### 1. PID Controller for Batch Size

**Purpose**: Maintains target P95 latency while maximizing energy efficiency.

**Parameters**:
- `Kp` (Proportional): 2.0
- `Ki` (Integral): 0.2
- `Kd` (Derivative): 0.1

**Control Logic**:
```
error = target_latency - current_latency
output = Kp * error + Ki * integral + Kd * derivative
batch_size = clamp(current_batch + output, min_batch, max_batch)
```

### 2. Power Cap Optimization

**Purpose**: Dynamically adjusts GPU power limits based on utilization and efficiency.

**Algorithm**:
- High utilization (>85%): Increase power cap
- Low utilization (<60%): Decrease power cap
- High J/req: Tighten power caps
- Low J/req: Relax power caps

### 3. Energy-Aware Scheduling

**Purpose**: Optimizes workload placement for energy efficiency.

**Strategies**:
- Bin-packing for better resource utilization
- Idle node consolidation
- Carbon-aware scheduling (time-based)
- Thermal-aware placement

## Safety Mechanisms

### 1. SLA Protection
- Hard latency boundaries
- Automatic revert on SLA breaches
- Fail-safe to default autoscaling

### 2. Thermal Protection
- Temperature monitoring
- Automatic power reduction on thermal events
- Node evacuation for critical temperatures

### 3. Stale Data Protection
- Metric staleness detection
- Automatic revert on stale metrics
- Health check failures

## Configuration

### Environment Variables

#### Agent
- `NODE_NAME`: Kubernetes node name
- `PORT`: Metrics port (default: 9100)

#### Energy API
- `PROM_URL`: Prometheus server URL
- `ENERGY_THRESHOLD`: Joules/request threshold

#### Controller
- `PROM_URL`: Prometheus server URL
- `ENERGY_API_URL`: Energy API URL
- `JOULES_PER_REQ_THRESHOLD`: Target J/req
- `PID_KP`, `PID_KI`, `PID_KD`: PID parameters
- `BATCH_MIN`, `BATCH_MAX`: Batch size bounds
- `GPU_POWER_FLOOR`, `GPU_POWER_CEIL`: Power limits

### Energy Policy CRD

```yaml
apiVersion: energy.io/v1alpha1
kind: EnergyPolicy
metadata:
  name: inference-optimization
spec:
  targetNamespace: inference
  powerCaps:
    gpu: 250
    cpu: 150
  sla:
    p95LatencyMs: 200
    errorRatePercent: 0.1
  autoscaling:
    targetJoulesPerRequest: 150
    minReplicas: 2
    maxReplicas: 10
  optimization:
    enabled: true
    aggressiveness: balanced
```

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Energy Reduction | 15-30% | kWh saved vs baseline |
| Joules/Request | -20% | Energy per request |
| Idle Energy | -30% | Power when QPS ≈ 0 |
| PUE | -0.05 | Power Usage Effectiveness |
| Latency Impact | <5% | P95 latency increase |

## Monitoring and Alerting

### Key Metrics
- `energy_joules_per_request` - Energy efficiency
- `node_total_power_watts` - Node power consumption
- `energy_optimization_score` - Optimization effectiveness
- `gpu_utilization_percent` - GPU utilization

### Alerts
- High energy consumption
- SLA breach risk
- Thermal events
- Optimization failures
- Stale metrics

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Kubernetes Cluster                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Node 1    │  │   Node 2    │  │   Node N    │     │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │     │
│  │ │  Agent  │ │  │ │  Agent  │ │  │ │  Agent  │ │     │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Energy API  │  │ Controller  │  │ Prometheus  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Grafana   │  │    KEDA     │  │ Workloads   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

This architecture provides a comprehensive energy optimization solution that can be deployed on any Kubernetes cluster with GPU support.
