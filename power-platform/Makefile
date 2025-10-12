.PHONY: help setup dev test demo clean

help:
	@echo "Power Platform - Makefile Commands"
	@echo "==================================="
	@echo "  make setup   - Install dependencies and setup environment"
	@echo "  make dev     - Start all services with Docker Compose"
	@echo "  make test    - Run all tests"
	@echo "  make demo    - Seed database and run demo"
	@echo "  make clean   - Stop services and clean up"

setup:
	@echo "Setting up development environment..."
	cd backend && python3 -m venv venv && \
		. venv/bin/activate && \
		pip install --upgrade pip && \
		pip install -r requirements.txt
	cd frontend && npm install
	cp deploy/env.example .env
	pre-commit install
	@echo "Setup complete! Run 'make dev' to start services."

dev:
	@echo "Starting all services..."
	docker-compose -f deploy/docker-compose.yml up --build

dev-detached:
	@echo "Starting all services in background..."
	docker-compose -f deploy/docker-compose.yml up -d --build

test:
	@echo "Running backend tests..."
	cd backend && . venv/bin/activate && pytest tests/ -v --cov=app

demo:
	@echo "Seeding database with demo data..."
	docker-compose -f deploy/docker-compose.yml exec api python -m app.db.seed
	@echo "Demo data loaded! Access at http://localhost:3000"

clean:
	@echo "Stopping services and cleaning up..."
	docker-compose -f deploy/docker-compose.yml down -v
	rm -rf backend/venv
	rm -rf frontend/node_modules
	rm -rf backend/app/static/exports/*

migrate:
	@echo "Running database migrations..."
	docker-compose -f deploy/docker-compose.yml exec api alembic upgrade head

logs:
	docker-compose -f deploy/docker-compose.yml logs -f

stop:
	docker-compose -f deploy/docker-compose.yml stop

restart:
	docker-compose -f deploy/docker-compose.yml restart
