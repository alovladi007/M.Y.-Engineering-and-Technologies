.PHONY: help install dev build test clean docker-up docker-down migrate seed

help:
	@echo "Available commands:"
	@echo "  install      Install all dependencies"
	@echo "  dev          Start development servers"
	@echo "  build        Build all services"
	@echo "  test         Run all tests"
	@echo "  clean        Clean build artifacts"
	@echo "  docker-up    Start Docker services"
	@echo "  docker-down  Stop Docker services"
	@echo "  migrate      Run database migrations"
	@echo "  seed         Seed the database"
	@echo "  e2e          Run E2E tests"

install:
	pnpm install
	cd services/agent && poetry install

dev:
	docker compose -f infra/docker/docker-compose.yml up -d db redis minio maildev
	pnpm run dev

build:
	pnpm run build
	cd services/agent && poetry build

test:
	pnpm run test
	cd services/agent && pytest

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf apps/*/dist apps/*/.next
	rm -rf services/agent/__pycache__
	rm -rf .turbo

docker-up:
	docker compose -f infra/docker/docker-compose.yml up -d --build

docker-down:
	docker compose -f infra/docker/docker-compose.yml down

docker-reset:
	docker compose -f infra/docker/docker-compose.yml down -v

migrate:
	pnpm --filter @apps/api run migrate

migrate-deploy:
	pnpm --filter @apps/api run migrate:deploy

seed:
	pnpm --filter @apps/api run seed

e2e:
	pnpm run e2e