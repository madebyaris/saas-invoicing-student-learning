# Invoicing SaaS - Docker-First Development Makefile
# All commands run in Docker containers for consistent development environment

.PHONY: help setup dev dev-backend dev-frontend dev-full dev-watch logs logs-backend logs-frontend shell shell-frontend status clean
.PHONY: db-reset db-migrate db-seed db-backup db-restore db-status db-inspect db-shell db-tables db-perf
.PHONY: test test-watch test-coverage test-integration test-rbac lint format security-check deps-check
.PHONY: build-prod build-frontend deploy-staging deploy-prod deploy-test health-check api-test frontend-test
.PHONY: project-status quick-debug code-stats git-status
.PHONY: seed-full seed-organizations seed-rbac-test seed-demo
.PHONY: stop restart rebuild

# Default target
help:
	@echo "🐳 Invoicing SaaS - Docker-First Development"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make setup           One-command setup (Docker only)"
	@echo "  make dev             🔥 Start full stack with HOT RELOAD (frontend + backend)"
	@echo "  make dev-backend     Start backend services only (API + DB)"
	@echo "  make dev-frontend    Start frontend only (React + Vite)"
	@echo "  make stop            Stop all running services"
	@echo "  make restart         Restart all services"
	@echo "  make project-status  📊 Show complete project overview"
	@echo ""
	@echo "📋 Development Commands:"
	@echo "  make logs            View all service logs"
	@echo "  make logs-backend    View backend logs only"
	@echo "  make logs-frontend   View frontend logs only"
	@echo "  make shell           Access backend container shell"
	@echo "  make shell-frontend  Access frontend container shell"
	@echo "  make status          Show service status"
	@echo "  make clean           Clean containers and volumes"
	@echo "  make rebuild         Rebuild all images from scratch"
	@echo "  make quick-debug     🔍 Quick debugging helper"
	@echo ""
	@echo "🗄️  Database Commands:"
	@echo "  make db-reset        Reset database with fresh migrations"
	@echo "  make db-migrate      Run database migrations"
	@echo "  make db-status       📊 Show migration status"
	@echo "  make seed-demo       🌱 Seed with demo data + test user"
	@echo "  make db-backup       Backup database to file"
	@echo "  make db-admin        Start pgAdmin (web UI at http://localhost:5050)"
	@echo "  make db-shell        🐚 Access PostgreSQL shell"
	@echo "  make db-tables       📋 List all database tables"
	@echo ""
	@echo "🧪 Testing & Quality:"
	@echo "  make test            Run backend tests"
	@echo "  make test-coverage   📊 Run tests with coverage report"
	@echo "  make frontend-test   Run frontend tests"
	@echo "  make lint            Run linting"
	@echo "  make format          🎨 Format code"
	@echo "  make health-check    ✅ Check API health"
	@echo "  make api-test        🧪 Test API endpoints"
	@echo ""
	@echo "🚀 Production & Deployment:"
	@echo "  make build-prod      Build production images (backend + frontend)"
	@echo "  make build-frontend  Build frontend production image"
	@echo "  make deploy-test     Deploy to test environment"
	@echo "  make deploy-staging  Deploy to staging"
	@echo "  make deploy-prod     Deploy to production"
	@echo ""
	@echo "📍 Service URLs:"
	@echo "  Frontend:  http://localhost:3000  (dev with hot reload)"
	@echo "  Backend:   http://localhost:8080  (API with hot reload)"
	@echo "  pgAdmin:   http://localhost:5050  (database UI)"
	@echo ""
	@echo "🔑 Test Credentials:"
	@echo "  Email:     admin@invoicing.com"
	@echo "  Password:  password123"
	@echo ""
	@echo "💡 Requirements: Docker and Docker Compose V2"
	@echo "📖 All services run in containers - no local dependencies needed!"

# =============================================================================
# SETUP & QUICK START
# =============================================================================

# One-command setup for new developers
setup:
	@echo "🚀 Setting up Invoicing SaaS development environment..."
	@echo ""
	@echo "📋 Checking requirements..."
	@which docker || (echo "❌ Docker is required but not installed" && exit 1)
	@docker compose version || (echo "❌ Docker Compose V2 is required" && exit 1)
	@echo "✅ Docker and Docker Compose found"
	@echo ""
	@echo "🐳 Building development images..."
	@docker compose --profile dev build
	@echo ""
	@echo "🗄️  Starting database and running migrations..."
	@docker compose --profile backend up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 10
	@make db-migrate
	@echo ""
	@echo "🎉 Setup complete!"
	@echo ""
	@echo "📋 Next steps:"
	@echo "  1. Run 'make dev' to start development"
	@echo "  2. API will be available at http://localhost:8080"
	@echo "  3. Health check: http://localhost:8080/health"
	@echo "  4. Use 'make logs' to view service logs"

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

# Start full development stack (frontend + backend + database) with hot reload
dev:
	@echo "🚀 Starting full development stack with HOT RELOAD..."
	@echo ""
	@echo "📦 Services starting:"
	@echo "  - PostgreSQL (database)"
	@echo "  - Go Backend API (hot reload with Air)"
	@echo "  - React Frontend (hot reload with Vite)"
	@echo ""
	@docker compose --profile dev up
	@echo ""
	@echo "✅ Services started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Login:    admin@invoicing.com / password123"

# Start full stack in detached mode
dev-detached:
	@echo "🚀 Starting full stack in background..."
	@docker compose --profile dev up -d
	@echo "✅ Services started in background"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Use 'make logs' to view logs"

# Start backend services only (database + API)
dev-backend:
	@echo "🚀 Starting backend services (PostgreSQL + API)..."
	@docker compose --profile backend up

# Start frontend only (requires backend running)
dev-frontend:
	@echo "🚀 Starting frontend development server..."
	@echo "⚠️  Make sure backend is running: make dev-backend"
	@docker compose up frontend

# Start full stack (all services)
dev-full:
	@echo "🚀 Starting complete stack (frontend + backend + pgAdmin)..."
	@docker compose --profile full up

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	@docker compose --profile dev down
	@docker compose --profile full down
	@echo "✅ All services stopped"

# Restart all services
restart:
	@echo "🔄 Restarting all services..."
	@make stop
	@sleep 2
	@make dev-detached
	@echo "✅ Services restarted"

# View logs from all services
logs:
	@echo "📋 Viewing service logs (Ctrl+C to exit)..."
	@docker compose --profile dev logs -f

# View backend logs only
logs-backend:
	@echo "📋 Viewing backend logs (Ctrl+C to exit)..."
	@docker compose logs -f backend

# View frontend logs only
logs-frontend:
	@echo "📋 Viewing frontend logs (Ctrl+C to exit)..."
	@docker compose logs -f frontend

# Access backend container shell
shell:
	@echo "🐚 Accessing backend container shell..."
	@docker compose exec backend sh

# Access frontend container shell
shell-frontend:
	@echo "🐚 Accessing frontend container shell..."
	@docker compose exec frontend sh

# Show service status
status:
	@echo "📊 Service Status:"
	@docker compose --profile dev ps
	@echo ""
	@echo "🌐 Service URLs:"
	@curl -s http://localhost:3000 > /dev/null && echo "  ✅ Frontend: http://localhost:3000" || echo "  ❌ Frontend: Not running"
	@curl -s http://localhost:8080/health > /dev/null && echo "  ✅ Backend:  http://localhost:8080" || echo "  ❌ Backend:  Not running"
	@curl -s http://localhost:5050 > /dev/null && echo "  ✅ pgAdmin:  http://localhost:5050" || echo "  ⚠️  pgAdmin:  Not running"

# Clean containers and volumes
clean:
	@echo "🧹 Cleaning Docker containers and volumes..."
	@docker compose --profile dev down -v
	@docker compose --profile backend down -v
	@docker compose --profile full down -v
	@docker system prune -f
	@echo "✅ Cleanup complete"

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

# Reset database with fresh migrations
db-reset:
	@echo "🗄️  Resetting database with fresh migrations..."
	@docker compose --profile backend down postgres
	@docker volume rm saas-invoicing_postgres_data 2>/dev/null || true
	@docker compose --profile backend up -d postgres
	@echo "⏳ Waiting for PostgreSQL to be ready..."
	@sleep 10
	@make db-migrate
	@echo "✅ Database reset complete"

# Run database migrations
db-migrate:
	@echo "🗄️  Running database migrations..."
	@docker compose --profile backend --profile migrate run --rm migrate up
	@echo "✅ Migrations complete"

# Seed database with demo user for testing
seed-demo:
	@echo "🌱 Seeding database with demo user..."
	@echo ""
	@echo "Creating test user account..."
	@curl -s -X POST http://localhost:8080/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"admin@invoicing.com","password":"password123","first_name":"Admin","last_name":"User"}' \
		> /dev/null 2>&1 || echo "User may already exist"
	@echo ""
	@echo "✅ Demo data seeded successfully!"
	@echo ""
	@echo "🔑 Test Credentials:"
	@echo "  Email:    admin@invoicing.com"
	@echo "  Password: password123"
	@echo ""
	@echo "🌐 Login at: http://localhost:3000/login"

# Legacy seed command
db-seed: seed-demo

# Backup database to file
db-backup:
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@docker compose exec postgres pg_dump -U postgres invoicing > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/ directory"

# Restore database from backup
db-restore:
	@echo "📥 Restoring database from backup..."
	@echo "Available backups:"
	@ls -la backups/*.sql 2>/dev/null || echo "No backups found"
	@echo "Usage: docker compose exec postgres psql -U postgres invoicing < backups/your_backup.sql"

# Start pgAdmin for database management
db-admin:
	@echo "🎛️  Starting pgAdmin for database management..."
	@docker compose --profile backend --profile pgadmin up -d postgres pgadmin
	@echo "✅ pgAdmin started successfully"
	@echo ""
	@echo "📋 pgAdmin Access Information:"
	@echo "  🌐 URL: http://localhost:5050"
	@echo "  📧 Email: admin@invoicing.com"
	@echo "  🔑 Password: admin123"
	@echo ""
	@echo "📊 Pre-configured Server:"
	@echo "  📛 Name: Invoicing SaaS PostgreSQL"
	@echo "  🏠 Host: postgres"
	@echo "  🔌 Port: 5432"
	@echo "  🗄️  Database: invoicing"
	@echo "  👤 Username: postgres"
	@echo "  🔐 Password: password"

# Stop pgAdmin
db-admin-stop:
	@echo "🛑 Stopping pgAdmin..."
	@docker compose stop pgadmin
	@echo "✅ pgAdmin stopped"

# Show migration status
db-status:
	@echo "📊 Database Migration Status:"
	@echo ""
	@docker compose --profile backend --profile migrate run --rm migrate version 2>/dev/null || echo "Run 'make db-migrate' to initialize migrations"
	@echo ""
	@echo "📋 Available Migrations:"
	@ls -1 invoicing-backend/migrations/*.up.sql | sed 's/invoicing-backend\/migrations\//  - /' | sed 's/.up.sql//'

# Access PostgreSQL shell directly
db-shell:
	@echo "🐚 Accessing PostgreSQL shell..."
	@echo "💡 Type \\dt to list tables, \\d table_name to describe a table, \\q to quit"
	@docker compose exec postgres psql -U postgres -d invoicing

# List all database tables with row counts
db-tables:
	@echo "📋 Database Tables Overview:"
	@echo ""
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT \
			schemaname as schema, \
			tablename as table, \
			pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size, \
			(SELECT COUNT(*) FROM users) as user_count, \
			(SELECT COUNT(*) FROM clients) as client_count, \
			(SELECT COUNT(*) FROM invoices) as invoice_count, \
			(SELECT COUNT(*) FROM organizations) as org_count \
		FROM pg_tables \
		WHERE schemaname = 'public' \
		LIMIT 1;" 2>/dev/null || echo "Database not ready. Run 'make dev' first."
	@echo ""
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT tablename, \
			pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size \
		FROM pg_tables \
		WHERE schemaname = 'public' \
		ORDER BY tablename;" 2>/dev/null || true

# Inspect database schema details
db-inspect:
	@echo "🔍 Database Schema Inspection:"
	@echo ""
	@echo "📊 Organizations Table:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\d organizations" 2>/dev/null || true
	@echo ""
	@echo "📊 Users Table:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\d users" 2>/dev/null || true
	@echo ""
	@echo "📊 Clients Table:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\d clients" 2>/dev/null || true
	@echo ""
	@echo "📊 Invoices Table:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\d invoices" 2>/dev/null || true
	@echo ""
	@echo "📊 Subscriptions Table:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\d subscriptions" 2>/dev/null || true
	@echo ""
	@echo "📊 Roles Table:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\d roles" 2>/dev/null || true

# Database performance analysis
db-perf:
	@echo "⚡ Database Performance Analysis:"
	@echo ""
	@echo "📊 Top 10 Largest Tables:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT \
			schemaname || '.' || tablename AS table_name, \
			pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size, \
			pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size, \
			pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size \
		FROM pg_tables \
		WHERE schemaname = 'public' \
		ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC \
		LIMIT 10;"
	@echo ""
	@echo "🔍 Index Usage:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT \
			schemaname, \
			tablename, \
			indexname, \
			pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size \
		FROM pg_indexes \
		WHERE schemaname = 'public' \
		ORDER BY pg_relation_size(indexname::regclass) DESC \
		LIMIT 10;"
	@echo ""
	@echo "📈 Database Connections:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT \
			datname, \
			numbackends as connections, \
			xact_commit as commits, \
			xact_rollback as rollbacks \
		FROM pg_stat_database \
		WHERE datname = 'invoicing';"

# Seed database with comprehensive demo data
seed-full:
	@echo "🌱 Seeding database with comprehensive demo data..."
	@echo ""
	@echo "📊 Creating demo organization, users, clients, and invoices..."
	@docker compose exec postgres psql -U postgres -d invoicing << 'EOF'
		-- This will be created by the migration already
		DO \$$\$$
		BEGIN
			-- Insert demo users (passwords are hashed 'password123')
			INSERT INTO users (id, email, password_hash, first_name, last_name, company_name, current_organization_id) VALUES
			('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@acme.com', '\$$2a\$$10\$$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John', 'Admin', 'ACME Corp', 'f47ac10b-58cc-4372-a567-0e02b2c3d999'),
			('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'user@acme.com', '\$$2a\$$10\$$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Jane', 'User', 'ACME Corp', 'f47ac10b-58cc-4372-a567-0e02b2c3d999'),
			('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'viewer@acme.com', '\$$2a\$$10\$$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bob', 'Viewer', 'ACME Corp', 'f47ac10b-58cc-4372-a567-0e02b2c3d999')
			ON CONFLICT (email) DO NOTHING;

			-- Assign roles to users
			INSERT INTO user_organization_roles (user_id, organization_id, role_id) VALUES
			('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f47ac10b-58cc-4372-a567-0e02b2c3d999', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'), -- org_admin
			('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f47ac10b-58cc-4372-a567-0e02b2c3d999', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'), -- org_user
			('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f47ac10b-58cc-4372-a567-0e02b2c3d999', 'f47ac10b-58cc-4372-a567-0e02b2c3d482')  -- org_viewer
			ON CONFLICT (user_id, organization_id) DO NOTHING;

			-- Insert demo clients
			INSERT INTO clients (organization_id, user_id, name, email, company_name, address_line1, address_city, address_country, address_postal_code) VALUES
			('f47ac10b-58cc-4372-a567-0e02b2c3d999', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tech Solutions Inc', 'billing@techsolutions.com', 'Tech Solutions Inc', '123 Tech Street', 'San Francisco', 'USA', '94102'),
			('f47ac10b-58cc-4372-a567-0e02b2c3d999', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Design Studio Co', 'accounts@designstudio.com', 'Design Studio Co', '456 Creative Ave', 'New York', 'USA', '10001'),
			('f47ac10b-58cc-4372-a567-0e02b2c3d999', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Marketing Agency', 'finance@marketingagency.com', 'Marketing Agency', '789 Brand Blvd', 'Los Angeles', 'USA', '90001')
			ON CONFLICT DO NOTHING;
		END\$$\$$;
	EOF
	@echo "✅ Demo data seeded successfully"
	@echo ""
	@echo "🔑 Demo Accounts:"
	@echo "  Admin:  admin@acme.com (password: password123)"
	@echo "  User:   user@acme.com (password: password123)"
	@echo "  Viewer: viewer@acme.com (password: password123)"

# =============================================================================
# TESTING & QUALITY
# =============================================================================

# Run tests in container
test:
	@echo "🧪 Running tests in container..."
	@docker compose --profile backend up -d postgres
	@docker compose run --rm backend go test ./...

# Run tests with watch mode
test-watch:
	@echo "🧪 Running tests with watch mode..."
	@docker compose --profile backend up -d postgres
	@docker compose run --rm backend sh -c "go install github.com/cosmtrek/air@latest && air -c .air.test.toml"

# Run tests with coverage report
test-coverage:
	@echo "📊 Running tests with coverage report..."
	@docker compose --profile backend up -d postgres
	@docker compose run --rm backend sh -c "\
		go test -coverprofile=coverage.out ./... && \
		go tool cover -html=coverage.out -o coverage.html && \
		go tool cover -func=coverage.out"
	@echo ""
	@echo "✅ Coverage report generated: invoicing-backend/coverage.html"
	@echo "💡 Open coverage.html in your browser to see detailed coverage"

# Run integration tests
test-integration:
	@echo "🧪 Running integration tests..."
	@echo "⚠️  This will reset the test database"
	@docker compose --profile backend up -d postgres
	@sleep 5
	@docker compose run --rm backend sh -c "\
		go test -tags=integration -v ./internal/... -run Integration"

# Test RBAC permissions
test-rbac:
	@echo "🔐 Testing RBAC permissions..."
	@echo ""
	@echo "📋 Testing role-based access control..."
	@docker compose --profile backend up -d postgres
	@docker compose run --rm backend sh -c "\
		go test -v ./internal/middleware -run RBAC"
	@echo ""
	@echo "💡 Check that all RBAC tests pass for proper security"

# Run linting in container
lint:
	@echo "🔍 Running linting in container..."
	@docker compose run --rm backend sh -c "\
		go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest && \
		golangci-lint run"

# Format Go code
format:
	@echo "🎨 Formatting Go code..."
	@docker compose run --rm backend sh -c "\
		go fmt ./... && \
		go install golang.org/x/tools/cmd/goimports@latest && \
		goimports -w ."
	@echo "✅ Code formatted"

# Run security vulnerability scan
security-check:
	@echo "🔒 Running security vulnerability scan..."
	@echo ""
	@echo "📊 Checking for known vulnerabilities in dependencies..."
	@docker compose run --rm backend sh -c "\
		go install golang.org/x/vuln/cmd/govulncheck@latest && \
		govulncheck ./..."
	@echo ""
	@echo "✅ Security scan complete"

# Check dependencies for updates
deps-check:
	@echo "📦 Checking dependencies for updates..."
	@echo ""
	@echo "📋 Current dependencies:"
	@docker compose run --rm backend go list -m all
	@echo ""
	@echo "🔍 Checking for outdated dependencies..."
	@docker compose run --rm backend sh -c "\
		go list -u -m all 2>/dev/null | grep '\[' || echo 'All dependencies are up to date!'"
	@echo ""
	@echo "💡 Run 'go get -u ./...' to update dependencies"

# =============================================================================
# PRODUCTION & DEPLOYMENT COMMANDS
# =============================================================================

# Build all production images (backend + frontend)
build-prod:
	@echo "🏗️  Building production images..."
	@echo ""
	@echo "📦 Building backend production image..."
	@docker compose -f docker-compose.prod.yml build backend
	@echo ""
	@echo "📦 Building frontend production image..."
	@docker build -t invoicing-frontend-prod invoicing-frontend/
	@echo ""
	@echo "✅ Production images built successfully!"
	@echo ""
	@echo "🚀 Next steps:"
	@echo "  - Test: make deploy-test"
	@echo "  - Staging: make deploy-staging"
	@echo "  - Production: make deploy-prod"

# Build frontend production image only
build-frontend:
	@echo "🏗️  Building frontend production image..."
	@docker build -t invoicing-frontend-prod invoicing-frontend/
	@echo "✅ Frontend production image built"
	@echo ""
	@echo "💡 Test locally:"
	@echo "  docker run -d -p 8081:80 invoicing-frontend-prod"
	@echo "  Then visit: http://localhost:8081"

# Test frontend production build locally
frontend-test:
	@echo "🧪 Testing frontend production build..."
	@echo ""
	@echo "📦 Building production image..."
	@cd invoicing-frontend && pnpm build
	@echo ""
	@echo "🚀 Starting production container..."
	@docker run -d --name frontend-test -p 8081:80 invoicing-frontend-prod
	@echo ""
	@echo "✅ Frontend running at http://localhost:8081"
	@echo ""
	@echo "🧹 To stop: docker stop frontend-test && docker rm frontend-test"

# Deploy to test environment
deploy-test:
	@echo "🧪 Deploying to test environment..."
	@echo ""
	@echo "📦 Building images..."
	@make build-prod
	@echo ""
	@echo "🚀 Starting test deployment..."
	@docker compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "✅ Test deployment complete!"
	@echo ""
	@echo "📍 Test URLs:"
	@echo "  Frontend: http://localhost:80"
	@echo "  Backend:  http://localhost:8081"
	@echo ""
	@echo "💡 Monitor logs: docker compose -f docker-compose.prod.yml logs -f"

# Deploy to staging
deploy-staging:
	@echo "🚀 Deploying to staging environment..."
	@echo ""
	@echo "⚠️  This will deploy to staging. Continue? (Ctrl+C to cancel)"
	@read -p "Press Enter to continue..."
	@echo ""
	@echo "📦 Building staging images..."
	@docker compose -f docker-compose.staging.yml build
	@echo ""
	@echo "🚀 Deploying to staging..."
	@docker compose -f docker-compose.staging.yml up -d
	@echo ""
	@echo "✅ Deployed to staging!"
	@echo ""
	@echo "💡 Check status: docker compose -f docker-compose.staging.yml ps"

# Deploy to production
deploy-prod:
	@echo "🚀 PRODUCTION DEPLOYMENT"
	@echo ""
	@echo "⚠️  ⚠️  ⚠️  WARNING ⚠️  ⚠️  ⚠️"
	@echo "This will deploy to PRODUCTION environment!"
	@echo ""
	@echo "Pre-deployment checklist:"
	@echo "  ✓ Tests passed?"
	@echo "  ✓ Staging verified?"
	@echo "  ✓ Database backup created?"
	@echo "  ✓ Team notified?"
	@echo ""
	@read -p "Type 'DEPLOY' to continue: " confirm; \
	if [ "$$confirm" != "DEPLOY" ]; then \
		echo "❌ Deployment cancelled"; \
		exit 1; \
	fi
	@echo ""
	@echo "📦 Building production images..."
	@make build-prod
	@echo ""
	@echo "🚀 Deploying to production..."
	@docker compose -f docker-compose.prod.yml up -d
	@echo ""
	@echo "✅ Deployed to production!"
	@echo ""
	@echo "📊 Monitor deployment:"
	@echo "  Logs:   docker compose -f docker-compose.prod.yml logs -f"
	@echo "  Status: docker compose -f docker-compose.prod.yml ps"
	@echo "  Health: curl http://your-domain.com/health"

# =============================================================================
# API TESTING & HEALTH CHECKS
# =============================================================================

# Check API health
health-check:
	@echo "✅ Checking API health..."
	@echo ""
	@curl -s http://localhost:8080/health | grep -q "ok" && \
		echo "✅ API is healthy!" || \
		echo "❌ API is not responding"
	@echo ""
	@echo "📊 API Endpoints Status:"
	@curl -s -o /dev/null -w "  Health:  %{http_code}\n" http://localhost:8080/health
	@curl -s -o /dev/null -w "  API:     %{http_code}\n" http://localhost:8080/api
	@echo ""
	@echo "💡 200 = OK, 404 = Not Found, 000 = Not Running"

# Test API endpoints
api-test:
	@echo "🧪 Testing API Endpoints..."
	@echo ""
	@echo "📋 Testing authentication endpoints..."
	@echo "  POST /api/auth/register"
	@curl -s -X POST http://localhost:8080/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"test@test.com","password":"test123","first_name":"Test","last_name":"User"}' \
		-w "\n  Status: %{http_code}\n" || echo "  ❌ Failed"
	@echo ""
	@echo "  POST /api/auth/login"
	@curl -s -X POST http://localhost:8080/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email":"admin@acme.com","password":"password123"}' \
		-w "\n  Status: %{http_code}\n" || echo "  ❌ Failed"
	@echo ""
	@echo "✅ API endpoint tests complete"
	@echo "💡 Use 'make health-check' for quick status check"

# =============================================================================
# CODE QUALITY & STATISTICS
# =============================================================================

# Show code statistics
code-stats:
	@echo "📈 Code Statistics:"
	@echo ""
	@echo "📊 Go Code Metrics:"
	@docker compose run --rm backend sh -c "\
		echo '  Total Lines:' && \
		find . -name '*.go' -not -path './vendor/*' -not -path './tmp/*' | xargs wc -l | tail -1 && \
		echo '  Total Files:' && \
		find . -name '*.go' -not -path './vendor/*' -not -path './tmp/*' | wc -l && \
		echo '  Packages:' && \
		go list ./... | wc -l"
	@echo ""
	@echo "📁 Project Structure:"
	@echo "  Handlers:    $(shell find invoicing-backend/internal/handlers -name '*.go' 2>/dev/null | wc -l | tr -d ' ') files"
	@echo "  Services:    $(shell find invoicing-backend/internal/services -name '*.go' 2>/dev/null | wc -l | tr -d ' ') files"
	@echo "  Models:      $(shell find invoicing-backend/internal/models -name '*.go' 2>/dev/null | wc -l | tr -d ' ') files"
	@echo "  Middleware:  $(shell find invoicing-backend/internal/middleware -name '*.go' 2>/dev/null | wc -l | tr -d ' ') files"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  Migrations:  $(shell ls -1 invoicing-backend/migrations/*.up.sql 2>/dev/null | wc -l | tr -d ' ') files"
	@echo ""
	@echo "📦 Dependencies:"
	@docker compose run --rm backend sh -c "go list -m all | wc -l | xargs echo '  Direct + Indirect:'"

# Enhanced git status
git-status:
	@echo "📊 Enhanced Git Status:"
	@echo ""
	@git status -sb 2>/dev/null || echo "Not a git repository"
	@echo ""
	@echo "📈 Recent Activity:"
	@git log --oneline --graph --decorate -10 2>/dev/null || echo "No commits yet"
	@echo ""
	@echo "📊 Branch Information:"
	@git branch -v 2>/dev/null || echo "No branches yet"
	@echo ""
	@echo "📁 Untracked Files:"
	@git ls-files --others --exclude-standard | head -10 || echo "None"

# =============================================================================
# DEVELOPER EXPERIENCE & DEBUGGING
# =============================================================================

# Complete project status overview
project-status:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║          📊 INVOICING SAAS - PROJECT STATUS OVERVIEW          ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "🐳 Docker Services:"
	@docker compose --profile dev ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  Services not running. Run 'make dev' to start."
	@echo ""
	@echo "🗄️  Database Status:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT \
			'Users: ' || COUNT(*)::text FROM users \
		UNION ALL \
		SELECT 'Organizations: ' || COUNT(*)::text FROM organizations \
		UNION ALL \
		SELECT 'Clients: ' || COUNT(*)::text FROM clients \
		UNION ALL \
		SELECT 'Invoices: ' || COUNT(*)::text FROM invoices \
		UNION ALL \
		SELECT 'Roles: ' || COUNT(*)::text FROM roles;" 2>/dev/null || echo "  Database not accessible"
	@echo ""
	@echo "🔧 Migration Status:"
	@docker compose --profile backend --profile migrate run --rm migrate version 2>/dev/null || echo "  Run 'make db-migrate' first"
	@echo ""
	@echo "🌐 API Endpoints:"
	@curl -s http://localhost:8080/health > /dev/null && echo "  ✅ http://localhost:8080/health - OK" || echo "  ❌ API not responding"
	@curl -s http://localhost:5050 > /dev/null && echo "  ✅ http://localhost:5050 - pgAdmin" || echo "  ⚠️  pgAdmin not running (make db-admin)"
	@echo ""
	@echo "📊 System Resources:"
	@echo "  Docker Disk Usage:"
	@docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}" 2>/dev/null
	@echo ""
	@echo "📁 Project Structure:"
	@echo "  Backend:     $(shell find invoicing-backend -name '*.go' 2>/dev/null | wc -l | tr -d ' ') Go files"
	@echo "  Migrations:  $(shell ls invoicing-backend/migrations/*.up.sql 2>/dev/null | wc -l) migrations"
	@echo "  Tests:       $(shell find invoicing-backend -name '*_test.go' 2>/dev/null | wc -l | tr -d ' ') test files"
	@echo ""
	@echo "🎯 Quick Actions:"
	@echo "  make dev             - Start development environment"
	@echo "  make logs            - View service logs"
	@echo "  make db-admin        - Open database UI"
	@echo "  make test-coverage   - Run tests with coverage"
	@echo "  make api-test        - Test API endpoints"
	@echo ""
	@echo "💡 Run 'make help' for all available commands"

# Quick debugging helper
quick-debug:
	@echo "🔍 Quick Debug Information:"
	@echo ""
	@echo "📊 Service Status:"
	@docker compose ps
	@echo ""
	@echo "🔥 Recent Backend Logs (last 20 lines):"
	@docker compose logs --tail=20 backend 2>/dev/null || echo "Backend not running"
	@echo ""
	@echo "🗄️  Database Connectivity:"
	@docker compose exec postgres pg_isready -U postgres 2>/dev/null && echo "  ✅ PostgreSQL is ready" || echo "  ❌ PostgreSQL not accessible"
	@echo ""
	@echo "🌐 Port Status:"
	@lsof -i :8080 2>/dev/null | grep LISTEN && echo "  ✅ Port 8080 is in use" || echo "  ⚠️  Port 8080 is free"
	@lsof -i :5432 2>/dev/null | grep LISTEN && echo "  ✅ Port 5432 is in use" || echo "  ⚠️  Port 5432 is free"
	@echo ""
	@echo "💾 Recent Database Activity:"
	@docker compose exec postgres psql -U postgres -d invoicing -c "\
		SELECT \
			pid, \
			usename, \
			application_name, \
			state, \
			query \
		FROM pg_stat_activity \
		WHERE datname = 'invoicing' \
		ORDER BY query_start DESC \
		LIMIT 5;" 2>/dev/null || echo "  Cannot access database"
	@echo ""
	@echo "💡 Common Issues:"
	@echo "  - Port already in use? Run: make clean && make dev"
	@echo "  - Database errors? Run: make db-reset"
	@echo "  - Stale containers? Run: make rebuild"

# =============================================================================
# UTILITIES & DEBUGGING
# =============================================================================

# Show Docker system information
docker-info:
	@echo "🐳 Docker System Information:"
	@docker version
	@echo ""
	@docker compose version
	@echo ""
	@echo "📊 Docker System Usage:"
	@docker system df
	@echo ""
	@echo "🔧 Go Version in Container:"
	@docker compose run --rm backend go version

# Rebuild all images from scratch
rebuild:
	@echo "🔄 Rebuilding all images from scratch..."
	@docker compose --profile dev build --no-cache
	@echo "✅ Rebuild complete"

# Optimize Docker setup
docker-optimize:
	@echo "⚡ Optimizing Docker setup..."
	@docker system prune -f
	@docker builder prune -f
	@docker compose --profile dev build --parallel
	@echo "✅ Docker optimization complete"

# Show environment information
env-info:
	@echo "🌍 Environment Information:"
	@echo "Docker Compose Profiles Available:"
	@echo "  - dev: PostgreSQL + Backend (development mode)"
	@echo "  - backend: PostgreSQL + Backend only"
	@echo "  - full: All services including frontend"
	@echo "  - migrate: Database migration service"
	@echo ""
	@echo "Services:"
	@echo "  - postgres: PostgreSQL 18 (port 5432)"
	@echo "  - backend: Go 1.25 API with hot reload (port 8080)"
	@echo "  - pgadmin: Database web UI (port 5050)"
	@echo "  - migrate: Database migration tool"
	@echo ""
	@echo "Latest Features:"
	@echo "  - Go 1.25 with latest performance improvements"
	@echo "  - Air hot reload with optimized configuration"
	@echo "  - Multi-stage Docker builds for efficiency"

# =============================================================================
# LEGACY COMPATIBILITY (for existing workflows)
# =============================================================================

# Legacy command compatibility
install-deps:
	@echo "📦 Docker-first setup - no local dependencies needed!"
	@echo "💡 Use 'make setup' for complete Docker environment setup"

build:
	@echo "🔨 Building in Docker container..."
	@docker compose run --rm backend go build -o bin/server cmd/server/main.go
	@echo "✅ Build complete in container"

run: dev-backend

# Quick development start (legacy)
quick-start: setup dev