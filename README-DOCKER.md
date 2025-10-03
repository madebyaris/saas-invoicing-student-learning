# Invoicing SaaS - Docker-First Development Guide

## 🐳 Overview

This project uses a **Docker-first development approach** where all services run in containers. No local dependencies (Go, PostgreSQL, etc.) are required except Docker and Docker Compose.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop or Docker Engine
- Docker Compose V2

### One-Command Setup
```bash
make setup
```

This will:
- Build development Docker images
- Start PostgreSQL database
- Run database migrations
- Prepare the development environment

### Start Development
```bash
make dev          # Full development stack
make dev-backend  # Backend services only
```

Your API will be available at:
- **Health Check**: http://localhost:8080/health
- **API Base**: http://localhost:8080

## 📋 Available Commands

### Development
```bash
make dev         # Start full development stack
make dev-backend # Start backend services only (PostgreSQL + API)
make dev-watch   # Development with hot reload (same as dev)
make logs        # View all service logs
make shell       # Access backend container shell
make status      # Show service status
make clean       # Clean containers and volumes
```

### Database Management
```bash
make db-reset    # Reset database with fresh migrations
make db-migrate  # Run database migrations
make db-seed     # Seed database with test data
make db-backup   # Backup database to file
make db-restore  # Restore database from backup
```

### Testing & Quality
```bash
make test        # Run tests in container
make test-watch  # Run tests with watch mode
make lint        # Run linting in container
```

### Production
```bash
make build-prod     # Build production images
make deploy-staging # Deploy to staging
make deploy-prod    # Deploy to production
```

## 🏗️ Architecture

### Docker Services

#### PostgreSQL Database (`postgres`)
- **Image**: `postgres:18-alpine`
- **Port**: `5432`
- **Database**: `invoicing`
- **Credentials**: `postgres:password`

#### Go Backend API (`backend`)
- **Build**: Multi-stage Dockerfile (development/production)
- **Port**: `8080`
- **Hot Reload**: Air for development
- **Health Check**: `/health` endpoint

#### Migration Service (`migrate`)
- **Image**: `migrate/migrate:v4.16.2`
- **Purpose**: Database schema management
- **Usage**: On-demand via `make db-migrate`

### Docker Compose Profiles

The project uses Docker Compose profiles for selective service startup:

- **`dev`**: PostgreSQL + Backend (development mode)
- **`backend`**: PostgreSQL + Backend only
- **`full`**: All services including frontend (when implemented)
- **`migrate`**: Database migration service

## 🔧 Development Workflow

### Daily Development
1. **Start Development**:
   ```bash
   make dev
   ```

2. **View Logs**:
   ```bash
   make logs
   ```

3. **Access Container**:
   ```bash
   make shell
   ```

4. **Run Tests**:
   ```bash
   make test
   ```

### Database Operations
1. **Reset Database**:
   ```bash
   make db-reset
   ```

2. **Run Migrations**:
   ```bash
   make db-migrate
   ```

3. **Seed Test Data**:
   ```bash
   make db-seed
   ```

### Hot Reload Development
The backend service uses [Air](https://github.com/cosmtrek/air) for hot reload:
- Code changes automatically trigger rebuilds
- No manual restart required
- Fast feedback loop

## 📁 Project Structure

```
invoicing-backend/
├── .air.toml          # Hot reload configuration
├── .air.test.toml     # Test watch configuration
├── Dockerfile         # Multi-stage build (dev/prod)
├── cmd/server/        # Application entry point
├── internal/          # Application code
├── migrations/        # Database migrations
└── ...

docker-compose.yml     # Docker services configuration
Makefile              # Docker-first commands
docker.env            # Docker environment variables
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :8080
lsof -i :5432

# Stop conflicting services
make clean
```

#### Database Connection Issues
```bash
# Reset database
make db-reset

# Check database status
make status
```

#### Container Build Issues
```bash
# Rebuild from scratch
make rebuild

# Clean Docker system
docker system prune -a
```

### Debugging Commands

#### View Service Status
```bash
make status
```

#### Access Database
```bash
docker compose exec postgres psql -U postgres -d invoicing
```

#### View Container Logs
```bash
# All services
make logs

# Specific service
docker compose logs backend
docker compose logs postgres
```

## 🚀 Production Deployment

### Build Production Images
```bash
make build-prod
```

### Deploy to Staging
```bash
make deploy-staging
```

### Deploy to Production
```bash
make deploy-prod
```

## 🔒 Environment Configuration

### Development Environment
- Configuration: `docker.env`
- Database: PostgreSQL in container
- Hot reload: Enabled via Air
- Debug mode: Enabled

### Production Environment
- Configuration: `docker-compose.prod.yml`
- Database: External PostgreSQL
- Optimized builds: Multi-stage Dockerfile
- Security: Production settings

## 📊 Performance Considerations

### Development Optimizations
- **Volume Mounting**: Source code mounted for hot reload
- **Layer Caching**: Optimized Dockerfile for fast rebuilds
- **Health Checks**: Ensure services are ready before dependent services start
- **Resource Limits**: Prevent resource exhaustion

### Production Optimizations
- **Multi-stage Builds**: Minimal production images
- **Alpine Base**: Small, secure base images
- **Static Binaries**: No runtime dependencies
- **Health Checks**: Proper monitoring and restart policies

## 🆘 Getting Help

### View All Commands
```bash
make help
```

### Environment Information
```bash
make env-info
```

### Docker System Information
```bash
make docker-info
```

## 🔄 Migration from Local Development

If you were previously using local Go and PostgreSQL:

1. **Stop Local Services**:
   ```bash
   # Stop local PostgreSQL
   brew services stop postgresql  # macOS
   sudo systemctl stop postgresql # Linux
   ```

2. **Use Docker Setup**:
   ```bash
   make setup
   make dev
   ```

3. **Migrate Data** (if needed):
   ```bash
   # Export from local PostgreSQL
   pg_dump invoicing > local_backup.sql
   
   # Import to Docker PostgreSQL
   make dev-backend
   docker compose exec postgres psql -U postgres invoicing < local_backup.sql
   ```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Air (Hot Reload)](https://github.com/cosmtrek/air)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

---

**🎉 Happy Coding with Docker!**

Your development environment is now consistent, reproducible, and requires zero local dependencies!
