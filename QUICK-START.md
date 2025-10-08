# 🚀 Quick Start Guide - Invoicing SaaS

## Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose V2** (included with Docker Desktop)
- **Git** (for cloning the repository)

That's it! No Node.js, Go, or PostgreSQL installation needed.

---

## 🎯 Development Workflow

### 1. First Time Setup

```bash
# Clone the repository
git clone <repository-url>
cd saas-invoicing

# One-command setup (builds images, starts database, runs migrations)
make setup

# Start full development stack with hot reload
make dev
```

**What happens:**
- PostgreSQL database starts
- Go backend API starts with hot reload (Air)
- React frontend starts with hot reload (Vite)

### 2. Access Your Application

Open your browser:

- **Frontend (Login)**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **pgAdmin (Database UI)**: http://localhost:5050 (run `make db-admin` first)

**Test Credentials:**
```
Email:    admin@invoicing.com
Password: password123
```

### 3. Create Test User (if needed)

```bash
make seed-demo
```

This creates the test user account automatically.

---

## 📋 Common Development Tasks

### Start/Stop Services

```bash
# Start full stack (frontend + backend + database)
make dev

# Start in background (detached mode)
make dev-detached

# Start backend only (API + database)
make dev-backend

# Start frontend only (requires backend running)
make dev-frontend

# Stop all services
make stop

# Restart all services
make restart
```

### View Logs

```bash
# View all logs
make logs

# View backend logs only
make logs-backend

# View frontend logs only
make logs-frontend
```

### Access Container Shells

```bash
# Backend container shell
make shell

# Frontend container shell
make shell-frontend

# Database shell (PostgreSQL)
make db-shell
```

### Check Service Status

```bash
# Show all services status
make status

# Quick debug information
make quick-debug

# Complete project overview
make project-status
```

---

## 🗄️ Database Management

### Migrations

```bash
# Run migrations
make db-migrate

# Check migration status
make db-status

# Reset database (fresh start)
make db-reset
```

### Database GUI

```bash
# Start pgAdmin (web-based database UI)
make db-admin

# Access at: http://localhost:5050
# Email: admin@invoicing.com
# Password: admin123
```

### Database Operations

```bash
# Access PostgreSQL shell
make db-shell

# List all tables
make db-tables

# Inspect schema
make db-inspect

# Create backup
make db-backup

# Performance analysis
make db-perf
```

---

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run integration tests
make test-integration

# Test RBAC permissions
make test-rbac
```

### Frontend Tests

```bash
# Test frontend production build
make frontend-test
```

### API Testing

```bash
# Check API health
make health-check

# Test API endpoints
make api-test
```

---

## 🚀 Production Deployment

### Build Production Images

```bash
# Build all production images (backend + frontend)
make build-prod

# Build frontend only
make build-frontend
```

### Deploy

```bash
# Deploy to test environment
make deploy-test

# Deploy to staging
make deploy-staging

# Deploy to production (requires confirmation)
make deploy-prod
```

---

## 🔧 Code Quality

### Linting & Formatting

```bash
# Run linter
make lint

# Format code
make format

# Security scan
make security-check

# Check dependencies
make deps-check
```

### Code Statistics

```bash
# Show code statistics
make code-stats

# Enhanced git status
make git-status
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Clean everything and start fresh
make clean
make setup
make dev
```

### Port Already in Use

```bash
# Stop all services
make stop

# Or kill specific port (example: 8080)
lsof -ti:8080 | xargs kill -9
```

### Database Issues

```bash
# Reset database
make db-reset

# Check database status
make db-status

# View database logs
docker compose logs postgres
```

### Hot Reload Not Working

```bash
# Restart services
make restart

# Check logs for errors
make logs-backend  # or logs-frontend
```

### Frontend Build Errors

```bash
# Access frontend container
make shell-frontend

# Run build manually
pnpm build

# Check for errors
```

### Backend Build Errors

```bash
# Access backend container
make shell

# Check Go version
go version

# Run build manually
go build -o bin/server cmd/server/main.go
```

---

## 📁 Project Structure

```
saas-invoicing/
├── invoicing-backend/       # Go backend API
│   ├── cmd/server/         # Application entry point
│   ├── internal/           # Private application code
│   │   ├── handlers/       # HTTP handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── middleware/     # HTTP middleware
│   └── migrations/         # Database migrations
├── invoicing-frontend/      # React frontend
│   ├── src/
│   │   ├── app/           # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   ├── Dockerfile         # Production build
│   └── nginx.conf         # Production server config
├── docker-compose.yml      # Development stack
├── docker-compose.prod.yml # Production stack
└── Makefile               # Development commands
```

---

## 🎯 Development Workflow Examples

### Feature Development

```bash
# 1. Start development environment
make dev

# 2. Make changes to code (hot reload active)
# - Backend: Edit files in invoicing-backend/
# - Frontend: Edit files in invoicing-frontend/src/

# 3. View logs if needed
make logs-backend
make logs-frontend

# 4. Test changes
make test
make api-test

# 5. Commit changes
git add .
git commit -m "Add new feature"
```

### Database Schema Changes

```bash
# 1. Create new migration files
# invoicing-backend/migrations/XXX_description.up.sql
# invoicing-backend/migrations/XXX_description.down.sql

# 2. Run migrations
make db-migrate

# 3. Verify changes
make db-tables
make db-inspect

# 4. Test with application
make dev
```

### Debugging

```bash
# 1. Check service status
make status

# 2. View logs
make logs

# 3. Access container shell
make shell  # or shell-frontend

# 4. Run quick debug
make quick-debug

# 5. Check database
make db-shell
\dt  # list tables
SELECT * FROM users;  # query data
```

---

## 💡 Tips & Best Practices

### Development

1. **Always use `make dev`** - Ensures all services start correctly
2. **Check logs regularly** - `make logs` helps catch issues early
3. **Use `make status`** - Quick way to see what's running
4. **Commit often** - Small, focused commits are easier to debug

### Database

1. **Backup before major changes** - `make db-backup`
2. **Use migrations** - Never modify database schema manually
3. **Test migrations** - Always test .up and .down migrations
4. **Use pgAdmin** - Visual tool helps understand data structure

### Testing

1. **Run tests before committing** - `make test`
2. **Check coverage** - `make test-coverage`
3. **Test API endpoints** - `make api-test`
4. **Test production builds** - `make build-prod`

### Production

1. **Test locally first** - `make deploy-test`
2. **Deploy to staging** - `make deploy-staging`
3. **Backup database** - `make db-backup`
4. **Monitor after deployment** - Check logs and health

---

## 🆘 Getting Help

### Quick Commands

```bash
# Show all available commands
make help

# Show project status
make project-status

# Quick debugging info
make quick-debug
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | `make stop` then `make dev` |
| Database connection error | `make db-reset` |
| Hot reload not working | `make restart` |
| Build errors | `make clean` then `make setup` |
| Migrations failing | Check migration files, run `make db-reset` |

### Resources

- **API Documentation**: `docs/api-reference.md`
- **Technical Guide**: `docs/technical-implementation-guide.md`
- **Frontend README**: `invoicing-frontend/README.md`
- **Backend README**: `invoicing-backend/README.md`

---

## 🎉 You're Ready!

Start developing:

```bash
make dev
```

Then open http://localhost:3000 and login with:
- Email: `admin@invoicing.com`
- Password: `password123`

Happy coding! 🚀
