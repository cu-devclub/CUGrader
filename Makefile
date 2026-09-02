# ==============================================================================
# CUGrader Makefile
# ==============================================================================

COMPOSE_DEV = docker compose -f docker-compose.dev.yml
COMPOSE_PROD = docker compose -f docker-compose.prod.yml

.PHONY: help dev up dev-build down down-v clean build logs logs-backend logs-frontend logs-auth logs-judge ps status restart prod-up prod-down audit test

# Default target
help:
	@echo "CUGrader Management Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start all development services in background"
	@echo "  make up           - Alias for 'make dev'"
	@echo "  make dev-build    - Rebuild images and start all dev services"
	@echo "  make down         - Stop and remove all dev containers"
	@echo "  make down-v       - Stop containers and remove volumes (clean database)"
	@echo "  make clean        - Alias for 'make down-v'"
	@echo "  make restart      - Restart all dev containers"
	@echo "  make build        - Build all dev docker images without starting"
	@echo "  make ps           - View running container status"
	@echo "  make status       - Alias for 'make ps'"
	@echo ""
	@echo "Logs:"
	@echo "  make logs         - View and follow logs of all services"
	@echo "  make logs-backend - View and follow backend service logs"
	@echo "  make logs-frontend- View and follow frontend service logs"
	@echo "  make logs-auth    - View and follow auth service logs"
	@echo "  make logs-judge   - View and follow python judge service logs"
	@echo ""
	@echo "Production:"
	@echo "  make prod-up      - Start production services in background"
	@echo "  make prod-down    - Stop production services"
	@echo ""
	@echo "Auditing & Testing:"
	@echo "  make audit        - Run vulnerability audit on all services"
	@echo "  make test         - Run tests and code checks across services"
	@echo ""

# Development commands
dev:
	$(COMPOSE_DEV) up -d

up: dev

dev-build:
	$(COMPOSE_DEV) up --build -d

down:
	$(COMPOSE_DEV) down

down-v:
	$(COMPOSE_DEV) down -v

clean: down-v

restart:
	$(COMPOSE_DEV) restart

build:
	$(COMPOSE_DEV) build

ps:
	$(COMPOSE_DEV) ps

status: ps

# Logs commands
logs:
	$(COMPOSE_DEV) logs -f

logs-backend:
	$(COMPOSE_DEV) logs -f backend

logs-frontend:
	$(COMPOSE_DEV) logs -f frontend

logs-auth:
	$(COMPOSE_DEV) logs -f authenticator

logs-judge:
	$(COMPOSE_DEV) logs -f judge_service_python

# Production commands
prod-up:
	$(COMPOSE_PROD) up -d

prod-down:
	$(COMPOSE_PROD) down

# Auditing and testing
audit:
	@echo "=== Frontend Dependency Audit ==="
	@cd Frontend/grader-frontend && npx pnpm audit || true
	@echo "=== Backend Go Vet ==="
	@cd backend && go vet ./...
	@echo "=== Auth Go Vet ==="
	@cd Auth && go vet ./...
	@echo "=== Judge Go Vet ==="
	@cd judge_service/python && go vet ./...

test:
	@echo "=== Testing Backend ==="
	@cd backend && go test ./...
	@echo "=== Testing Auth ==="
	@cd Auth && go test ./...
