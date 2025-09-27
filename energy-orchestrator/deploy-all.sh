#!/bin/bash
# Energy Orchestrator v0.7.0 - Complete Deployment Script

set -e

# Configuration
REGISTRY=${REGISTRY:-ghcr.io/yourorg/energy-orchestrator}
TAG=${TAG:-v0.7.0}
NAMESPACE=${NAMESPACE:-energy-system}

echo "================================================================================"
echo "Energy Orchestrator v0.7.0 - Deployment"
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo "Namespace: $NAMESPACE"
echo "================================================================================"

# Build all images
echo "Building container images..."
docker build -t $REGISTRY/agent:$TAG ./agent
docker build -t $REGISTRY/energy-api:$TAG ./energy-api
docker build -t $REGISTRY/controller:$TAG ./controller
docker build -t $REGISTRY/vllm-shim:$TAG ./serving-plugins/vllm
docker build -t $REGISTRY/trtllm-shim:$TAG ./serving-plugins/trtllm
docker build -t $REGISTRY/notifier:$TAG ./reports/notifier
docker build -t $REGISTRY/green-window:$TAG ./green-window
docker build -t $REGISTRY/controller-tuner:$TAG -f controller/Dockerfile.tuner ./controller
docker build -t $REGISTRY/grafana-snapshotter:$TAG ./tools/grafana_snapshotter
docker build -t $REGISTRY/prom-report:$TAG ./reports/prom-report

# Push images
echo "Pushing images to registry..."
docker push $REGISTRY/agent:$TAG
docker push $REGISTRY/energy-api:$TAG
docker push $REGISTRY/controller:$TAG
docker push $REGISTRY/vllm-shim:$TAG
docker push $REGISTRY/trtllm-shim:$TAG
docker push $REGISTRY/notifier:$TAG
docker push $REGISTRY/green-window:$TAG
docker push $REGISTRY/controller-tuner:$TAG
docker push $REGISTRY/grafana-snapshotter:$TAG
docker push $REGISTRY/prom-report:$TAG

# Install Helm dependencies
echo "Adding Helm repositories..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add kedacore https://kedacore.github.io/charts
helm repo update

# Deploy Energy Orchestrator
echo "Deploying Energy Orchestrator..."
helm upgrade --install energy ./infra/charts/energy \
  --namespace $NAMESPACE \
  --create-namespace \
  --set imageRegistry=$REGISTRY \
  --set imageTag=$TAG \
  --wait \
  --timeout 10m

# Apply CRDs
echo "Applying CRDs..."
kubectl apply -f infra/charts/energy/crds/

# Apply policies
echo "Applying energy policies..."
kubectl apply -f policies/

# Apply KEDA scalers
echo "Applying KEDA scalers..."
kubectl apply -f examples/keda-app-energy.yaml

# Deploy demo applications
echo "Deploying demo applications..."
kubectl apply -f examples/vllm-autoscale-batch-demo.yaml
kubectl apply -f examples/trtllm-with-keda.yaml

# Wait for deployments
echo "Waiting for deployments to be ready..."
kubectl -n $NAMESPACE wait --for=condition=available --timeout=5m deployment/energy-api
kubectl -n $NAMESPACE wait --for=condition=available --timeout=5m deployment/energy-controller
kubectl -n default wait --for=condition=available --timeout=5m deployment/vllm-demo || true
kubectl -n default wait --for=condition=available --timeout=5m deployment/trtllm-demo || true

# Display status
echo ""
echo "================================================================================"
echo "Deployment Complete!"
echo ""
echo "Access points:"
echo "  Grafana: kubectl -n $NAMESPACE port-forward svc/energy-grafana 3000:80"
echo "  Prometheus: kubectl -n $NAMESPACE port-forward svc/energy-kube-prometheus-prometheus 9090:9090"
echo "  Energy API: kubectl -n $NAMESPACE port-forward svc/energy-api 8000:8000"
echo ""
echo "View logs:"
echo "  kubectl -n $NAMESPACE logs -f deployment/energy-controller"
echo "  kubectl -n $NAMESPACE logs -f deployment/energy-api"
echo "  kubectl -n $NAMESPACE logs -f daemonset/energy-agent"
echo ""
echo "Generate report:"
echo "  kubectl -n $NAMESPACE create job --from=job/energy-report-generator manual-report"
echo "================================================================================"
