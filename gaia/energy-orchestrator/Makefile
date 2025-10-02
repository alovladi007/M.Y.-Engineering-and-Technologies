# Energy Orchestrator v1.0 Makefile
SHELL := /bin/bash
.PHONY: all build test deploy clean help

# Variables
REGISTRY ?= ghcr.io/yourorg/energy-orchestrator
VERSION ?= v1.0.0
NAMESPACE ?= energy-system
PYTHON := python3.11
GO := go1.21
DOCKER := docker
KUBECTL := kubectl
HELM := helm
TERRAFORM := terraform

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

# Main targets
all: deps build test deploy

deps:
	@echo -e "$(BLUE)Installing dependencies...$(NC)"
	@pip install -r requirements.txt
	@go mod download
	@npm install
	@$(HELM) dependency update infrastructure/helm/energy-orchestrator

build: build-agent build-api build-controller build-optimizer build-integrations
	@echo -e "$(GREEN)✓ All components built successfully$(NC)"

build-agent:
	@echo -e "$(YELLOW)Building Agent...$(NC)"
	@cd core/agent && \
		CGO_ENABLED=1 GOOS=linux $(GO) build -tags dcgm -o bin/agent ./...
	@$(DOCKER) build -t $(REGISTRY)/agent:$(VERSION) core/agent/

build-api:
	@echo -e "$(YELLOW)Building API...$(NC)"
	@$(DOCKER) build -t $(REGISTRY)/api:$(VERSION) core/api/

build-controller:
	@echo -e "$(YELLOW)Building Controller...$(NC)"
	@$(DOCKER) build -t $(REGISTRY)/controller:$(VERSION) core/controller/

build-optimizer:
	@echo -e "$(YELLOW)Building ML Optimizer...$(NC)"
	@$(DOCKER) build -t $(REGISTRY)/optimizer:$(VERSION) core/optimizer/

build-integrations:
	@echo -e "$(YELLOW)Building Integrations...$(NC)"
	@$(DOCKER) build -t $(REGISTRY)/vllm:$(VERSION) integrations/vllm/
	@$(DOCKER) build -t $(REGISTRY)/trtllm:$(VERSION) integrations/trtllm/
	@$(DOCKER) build -t $(REGISTRY)/triton:$(VERSION) integrations/triton/

test: test-unit test-integration
	@echo -e "$(GREEN)✓ All tests passed$(NC)"

test-unit:
	@echo -e "$(YELLOW)Running unit tests...$(NC)"
	@$(PYTHON) -m pytest tests/unit/ -v --cov=core --cov-report=term-missing
	@cd core/agent && $(GO) test ./... -v -cover

test-integration:
	@echo -e "$(YELLOW)Running integration tests...$(NC)"
	@$(PYTHON) -m pytest tests/integration/ -v

test-e2e:
	@echo -e "$(YELLOW)Running E2E tests...$(NC)"
	@$(KUBECTL) apply -f tests/e2e/test-workloads.yaml
	@$(PYTHON) -m pytest tests/e2e/ -v

benchmark:
	@echo -e "$(YELLOW)Running performance benchmarks...$(NC)"
	@$(PYTHON) tests/benchmarks/run_benchmarks.py

train-models:
	@echo -e "$(YELLOW)Training ML models...$(NC)"
	@cd ml/training && $(PYTHON) train_all_models.py

deploy: deploy-infra deploy-k8s deploy-monitoring
	@echo -e "$(GREEN)✓ Deployment complete$(NC)"

deploy-infra:
	@echo -e "$(YELLOW)Deploying infrastructure...$(NC)"
	@cd infrastructure/terraform && \
		$(TERRAFORM) init && \
		$(TERRAFORM) apply -auto-approve

deploy-k8s:
	@echo -e "$(YELLOW)Deploying to Kubernetes...$(NC)"
	@$(KUBECTL) create namespace $(NAMESPACE) --dry-run=client -o yaml | $(KUBECTL) apply -f -
	@$(HELM) upgrade --install energy-orchestrator \
		infrastructure/helm/energy-orchestrator \
		--namespace $(NAMESPACE) \
		--set image.registry=$(REGISTRY) \
		--set image.tag=$(VERSION) \
		--wait --timeout 10m

deploy-monitoring:
	@echo -e "$(YELLOW)Deploying monitoring stack...$(NC)"
	@$(KUBECTL) apply -f monitoring/prometheus/
	@$(KUBECTL) apply -f monitoring/grafana/
	@$(KUBECTL) apply -f monitoring/alerts/

push:
	@echo -e "$(YELLOW)Pushing images to registry...$(NC)"
	@$(DOCKER) push $(REGISTRY)/agent:$(VERSION)
	@$(DOCKER) push $(REGISTRY)/api:$(VERSION)
	@$(DOCKER) push $(REGISTRY)/controller:$(VERSION)
	@$(DOCKER) push $(REGISTRY)/optimizer:$(VERSION)
	@$(DOCKER) push $(REGISTRY)/vllm:$(VERSION)
	@$(DOCKER) push $(REGISTRY)/trtllm:$(VERSION)

clean:
	@echo -e "$(YELLOW)Cleaning up...$(NC)"
	@rm -rf bin/ dist/ *.egg-info __pycache__ .pytest_cache .coverage
	@$(DOCKER) system prune -f

# Development helpers
dev-setup:
	@echo -e "$(YELLOW)Setting up development environment...$(NC)"
	@python -m venv venv
	@source venv/bin/activate && pip install -e ".[dev]"
	@pre-commit install

dev-forward:
	@$(KUBECTL) port-forward -n $(NAMESPACE) svc/energy-api 8000:8000 &
	@$(KUBECTL) port-forward -n $(NAMESPACE) svc/grafana 3000:3000 &
	@$(KUBECTL) port-forward -n $(NAMESPACE) svc/prometheus 9090:9090 &

logs:
	@$(KUBECTL) logs -n $(NAMESPACE) -l app=energy-controller -f

status:
	@echo -e "$(BLUE)Cluster Energy Status:$(NC)"
	@$(KUBECTL) get energypolicies -A
	@$(KUBECTL) top nodes
	@$(KUBECTL) top pods -A | head -20

# ML Operations
mlops-train:
	@cd ml && dvc pull
	@cd ml && python training/train_optimizer.py
	@cd ml && dvc add models/
	@cd ml && dvc push

mlops-serve:
	@$(KUBECTL) apply -f ml/inference/serving.yaml

# Observability
metrics:
	@curl -s localhost:9090/api/v1/query?query=energy:cluster_joules_per_request | jq .

alerts:
	@$(KUBECTL) get prometheusrule -n $(NAMESPACE) -o yaml

dashboard:
	@open http://localhost:3000/d/energy-optimization/overview

# Help
help:
	@echo -e "$(BLUE)Energy Orchestrator v1.0 - Available Commands:$(NC)"
	@echo -e "  $(GREEN)make all$(NC)          - Build and deploy everything"
	@echo -e "  $(GREEN)make build$(NC)        - Build all components"
	@echo -e "  $(GREEN)make test$(NC)         - Run all tests"
	@echo -e "  $(GREEN)make deploy$(NC)       - Deploy to Kubernetes"
	@echo -e "  $(GREEN)make train-models$(NC) - Train ML models"
	@echo -e "  $(GREEN)make benchmark$(NC)    - Run performance benchmarks"
	@echo -e "  $(GREEN)make status$(NC)       - Show cluster energy status"
	@echo -e "  $(GREEN)make clean$(NC)        - Clean build artifacts"

.DEFAULT_GOAL := help
