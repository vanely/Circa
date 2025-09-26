# Circa Project Makefile
# This Makefile provides commands for building, running, and managing the Docker containers

.PHONY: help build build-backend build-frontend start stop restart logs logs-backend logs-frontend logs-postgres clean clean-volumes clean-all clean-images dev dev-foreground test status ps health-check health-status

# Default target
help:
	@echo "Circa Project - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  dev          - Start all services in development mode (background)"
	@echo "  dev-foreground - Start all services in foreground (shows logs)"
	@echo "  start        - Start all services"
	@echo "  stop         - Stop all services"
	@echo "  restart      - Restart all services"
	@echo ""
	@echo "Building:"
	@echo "  build        - Build all Docker images"
	@echo "  build-backend - Build only backend image"
	@echo "  build-frontend - Build only frontend image"
	@echo ""
	@echo "Monitoring:"
	@echo "  logs         - Show logs for all services"
	@echo "  logs-backend - Show backend logs"
	@echo "  logs-frontend - Show frontend logs"
	@echo "  logs-postgres - Show postgres logs"
	@echo "  status       - Show service status"
	@echo "  ps           - Show running containers"
	@echo "  health-check - Check service endpoints"
	@echo "  health-status - Show container health status"
	@echo ""
	@echo "Testing:"
	@echo "  test         - Run tests for all services"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean        - Stop and remove containers, networks"
	@echo "  clean-volumes - Remove all volumes (WARNING: deletes data)"
	@echo "  clean-all    - Clean everything including images"
	@echo "  clean-images - Remove ALL Docker images (WARNING: system-wide)"

# Development mode - starts with live reload via volume mounts
dev:
	@echo "Starting development environment with live file watching..."
	docker-compose -f docker/docker-compose.yml up --build -d
	@echo "Services started in background. Use 'make logs' to view logs or 'make stop' to stop services."

# Build all images
build:
	@echo "Building all Docker images..."
	docker-compose -f docker/docker-compose.yml build

# Build specific services
build-backend:
	@echo "Building backend image..."
	docker-compose -f docker/docker-compose.yml build backend

build-frontend:
	@echo "Building frontend image..."
	docker-compose -f docker/docker-compose.yml build frontend

# Start all services
start:
	@echo "Starting all services..."
	docker-compose -f docker/docker-compose.yml up -d

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose -f docker/docker-compose.yml down

# Restart all services
restart: stop start

# Show logs
logs:
	docker-compose -f docker/docker-compose.yml logs -f

logs-backend:
	docker-compose -f docker/docker-compose.yml logs -f backend

logs-frontend:
	docker-compose -f docker/docker-compose.yml logs -f frontend

logs-postgres:
	docker-compose -f docker/docker-compose.yml logs -f postgres

# Show service status
status:
	@echo "Service Status:"
	@docker-compose -f docker/docker-compose.yml ps
	@echo ""
	@echo "Health Checks:"
	@docker-compose -f docker/docker-compose.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Show running containers
ps:
	docker-compose -f docker/docker-compose.yml ps

# Run tests
test:
	@echo "Running backend tests..."
	docker-compose -f docker/docker-compose.yml exec backend pnpm test
	@echo "Running frontend tests..."
	docker-compose -f docker/docker-compose.yml exec frontend pnpm test

# Database operations
db-migrate:
	@echo "Running database migrations..."
	docker-compose -f docker/docker-compose.yml exec backend pnpm db:migrate

db-seed:
	@echo "Seeding database..."
	docker-compose -f docker/docker-compose.yml exec backend pnpm db:seed

# Cleanup commands
clean:
	@echo "Cleaning up containers and networks..."
	docker-compose -f docker/docker-compose.yml down --remove-orphans

clean-volumes:
	@echo "WARNING: This will delete all database data!"
	@echo "Removing volumes..."
	docker-compose -f docker/docker-compose.yml down -v --remove-orphans

clean-all: clean-volumes
	@echo "Removing Docker images..."
	docker-compose -f docker/docker-compose.yml down --rmi all --remove-orphans

# Remove all Docker images (WARNING: deletes all images on system)
clean-images:
	@echo "WARNING: This will delete ALL Docker images on your system!"
	@echo "This includes images not related to this project."
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "Removing all Docker images..."
	docker rmi $$(docker images -q) -f 2>/dev/null || echo "No images to remove or some images are in use"

# Health check endpoints
health-check:
	@echo "Checking service health..."
	@echo "Backend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/health || echo "DOWN")"
	@echo "Frontend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "DOWN")"
	@echo "Postgres: $$(docker-compose -f docker/docker-compose.yml exec -T postgres pg_isready -U postgres && echo "UP" || echo "DOWN")"

# Container health status
health-status:
	@echo "Container Health Status:"
	@echo "========================"
	@docker ps --format "table {{.Names}}\t{{.Status}}"
	@echo ""
	@echo "Detailed Health Status:"
	@echo "Postgres: $$(docker inspect circa-postgres-dev --format='{{.State.Health.Status}}' 2>/dev/null || echo 'no-health-check')"
	@echo "Backend: $$(docker inspect circa-backend-dev --format='{{.State.Health.Status}}' 2>/dev/null || echo 'no-health-check')"
	@echo "Frontend: $$(docker inspect circa-frontend-dev --format='{{.State.Health.Status}}' 2>/dev/null || echo 'no-health-check')"

# Install dependencies locally (for development)
install:
	@echo "Installing dependencies..."
	pnpm install

# Setup environment
setup: install
	@echo "Setting up environment..."
	@if [ ! -f .env ]; then \
		echo "Creating .env file from .env.example..."; \
		cp .env.example .env 2>/dev/null || echo "No .env.example found, please create .env manually"; \
	fi
	@echo "Environment setup complete!"
