REG?=ghcr.io/yourorg/energy-orchestrator
TAG?=v0.5.0

.PHONY: build push deploy undeploy kind-up kind-down test fmt lint clean

# Build all container images
build:
	@echo "Building Agent..."
	docker build -t $(REG)/agent:$(TAG) ./agent
	@echo "Building Energy API..."
	docker build -t $(REG)/energy-api:$(TAG) ./energy-api
	@echo "Building Controller..."
	docker build -t $(REG)/controller:$(TAG) ./controller
	@echo "Building vLLM Shim..."
	docker build -t $(REG)/vllm-shim:$(TAG) ./serving-plugins/vllm
	@echo "Building TensorRT-LLM Shim..."
	docker build -t $(REG)/trtllm-shim:$(TAG) ./serving-plugins/trtllm
	@echo "Building Notifier..."
	docker build -t $(REG)/notifier:$(TAG) ./reports/notifier

# Push all images to registry
push:
	docker push $(REG)/agent:$(TAG)
	docker push $(REG)/energy-api:$(TAG)
	docker push $(REG)/controller:$(TAG)
	docker push $(REG)/vllm-shim:$(TAG)
	docker push $(REG)/trtllm-shim:$(TAG)
	docker push $(REG)/notifier:$(TAG)

# Create local Kind cluster for development
kind-up:
	kind create cluster --name energy-dev --config kind-config.yaml || true
	kubectl cluster-info
	@echo "Installing NVIDIA GPU Operator (stub for Kind)..."
	kubectl apply -f https://raw.githubusercontent.com/NVIDIA/gpu-operator/master/deployments/gpu-operator-resources.yaml || true

# Delete Kind cluster
kind-down:
	kind delete cluster --name energy-dev || true

# Deploy the complete stack
deploy:
	@echo "Creating namespace..."
	kubectl create namespace energy-system || true
	@echo "Installing Prometheus Operator..."
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm repo add kedacore https://kedacore.github.io/charts
	helm repo update
	@echo "Deploying Energy Orchestrator..."
	helm upgrade --install energy ./infra/charts/energy --namespace energy-system \
		--set imageRegistry=$(REG) \
		--set imageTag=$(TAG) \
		--create-namespace \
		--wait

# Uninstall the stack
undeploy:
	helm uninstall energy -n energy-system || true
	kubectl delete namespace energy-system || true

# Run tests
test:
	@echo "Testing Agent..."
	cd agent && go test ./... -v
	@echo "Testing Energy API..."
	cd energy-api && pytest tests/ -v
	@echo "Testing Controller..."
	cd controller && pytest tests/ -v

# Format code
fmt:
	gofmt -w agent
	black energy-api controller reports
	isort energy-api controller reports

# Lint code
lint:
	golangci-lint run ./agent/...
	flake8 energy-api controller reports
	mypy energy-api controller reports

# Clean build artifacts
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .mypy_cache

# Development helpers
dev-forward-grafana:
	kubectl -n energy-system port-forward svc/energy-monitoring-grafana 3000:80

dev-forward-prometheus:
	kubectl -n energy-system port-forward svc/energy-monitoring-kube-prometheus-prometheus 9090:9090

dev-logs:
	kubectl -n energy-system logs -f -l app=energy-controller
	kubectl -n energy-system logs -f -l app=energy-api
	kubectl -n energy-system logs -f -l app=energy-agent

# Generate load for testing
load-test:
	kubectl apply -f examples/load-generator.yaml

# Show current energy metrics
metrics:
	@echo "Current cluster energy metrics:"
	@kubectl -n energy-system exec -it deploy/energy-api -- curl -s localhost:8000/metrics | grep -E "joules_per_request|power_draw|gpu_utilization"
