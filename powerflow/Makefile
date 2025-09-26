.PHONY: help build up down dev logs clean restart status

help: ## Show this help message
	@echo "PowerFlow Docker Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker images for production
	docker-compose build

up: ## Start production containers
	docker-compose up -d
	@echo ""
	@echo "✅ PowerFlow is running!"
	@echo ""
	@echo "📍 Frontend: http://localhost:3000"
	@echo "📍 API: http://localhost:4000"
	@echo "📍 API Docs: http://localhost:4000/api/docs"

down: ## Stop all containers
	docker-compose down

dev: ## Start development containers with hot-reload
	docker-compose -f docker-compose.dev.yml up
	
dev-build: ## Build and start development containers
	docker-compose -f docker-compose.dev.yml up --build

logs: ## Show container logs
	docker-compose logs -f

logs-api: ## Show API container logs
	docker-compose logs -f api

logs-web: ## Show Web container logs
	docker-compose logs -f web

clean: ## Remove containers and volumes
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v

restart: ## Restart all containers
	docker-compose restart

status: ## Show container status
	docker-compose ps

shell-api: ## Open shell in API container
	docker exec -it powerflow-api sh

shell-web: ## Open shell in Web container
	docker exec -it powerflow-web sh

pull: ## Pull latest images
	docker-compose pull

prune: ## Remove unused Docker resources
	docker system prune -af --volumes