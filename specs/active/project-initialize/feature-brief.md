# Project Initialize - Backend-First Invoicing SaaS with Docker

## Quick Context

**Problem**: Small businesses need simple invoicing tools but existing solutions are either too complex or lack modern architecture.

**Users**: Small business owners, freelancers, consultants who need to manage clients and create professional invoices.

**Success**: Users can create their first invoice within 5 minutes of signing up, with a scalable foundation for future features.

## 15-Minute Research Summary

**Market Analysis**:
- FreshBooks, QuickBooks, Wave dominate but are feature-heavy
- Need for simple, modern alternatives exists
- Go + React stack offers better performance and maintainability than legacy PHP/.NET solutions

**Technical Patterns**:
- Monolithic Go backend with Gin framework (mature, well-documented)
- PostgreSQL with GORM ORM (type-safe, migrations)
- JWT authentication (stateless, scalable)
- Docker containerization (consistent environments)

**Architecture Decision**:
- Backend-first approach allows API stability before frontend
- Separate Docker containers for backend, frontend, database
- RESTful API design for maximum compatibility

## Essential Requirements (From PRD)

### Core Features (MVP)
1. **Client Management**: CRUD operations with contact information
2. **Invoice Management**: Create, edit, view, send, download invoices
3. **Invoice Status**: Draft, Sent, Paid, Overdue, Cancelled
4. **Authentication**: JWT-based with email/password

### Technical Requirements
- **Backend**: Go 1.24+ with Gin framework
- **Database**: PostgreSQL 18 with GORM v2
- **Authentication**: JWT with golang-jwt/jwt v5
- **Validation**: go-playground/validator v10
- **CORS**: gin-contrib/cors middleware (simplified)
- **Migrations**: golang-migrate
- **Configuration**: viper
- **Logging**: logrus

### Database Schema
```sql
-- Core tables needed:
-- users (id, email, password_hash, first_name, last_name, company_name, timezone)
-- clients (id, user_id, name, email, phone, company_name, address fields, tax_id)
-- invoices (id, user_id, client_id, invoice_number, dates, status, amounts, notes)
-- invoice_items (id, invoice_id, description, quantity, unit_price, total_price)
```

## Implementation Approach

### Phase 1: Backend Foundation (Week 1)
1. **Project Setup**: Go module, basic structure, configuration
2. **Database Layer**: Connection, migrations, GORM models
3. **Authentication**: JWT middleware, register/login handlers
4. **Client API**: Full CRUD with validation
5. **Invoice API**: Full CRUD with business logic
6. **Docker Setup**: Backend container with health checks

### Phase 2: Frontend Integration (Week 2)
1. **React Setup**: Vite, TypeScript, TanStack stack
2. **API Integration**: TanStack Query for data fetching
3. **Authentication**: Better Auth integration
4. **Forms**: React Hook Form + Zod validation
5. **UI**: Tailwind CSS with component library

### Phase 3: Polish & Deploy (Week 2)
1. **Testing**: Unit tests for critical paths
2. **Docker Compose**: Full stack setup
3. **Makefile**: Comprehensive build and deployment automation
4. **Environment**: Production configuration
5. **Documentation**: API docs, deployment guide

## Technical Architecture

### Backend Structure
```
invoicing-backend/
├── cmd/server/main.go              # Application entry
├── internal/
│   ├── config/config.go           # Configuration management
│   ├── database/
│   │   ├── connection.go          # DB connection
│   │   └── migrations.go          # Migration runner
│   ├── models/                    # GORM models
│   ├── handlers/                  # HTTP handlers
│   ├── middleware/                # JWT, CORS, validation
│   ├── services/                  # Business logic
│   └── utils/                     # JWT, password, response
├── migrations/                    # SQL migration files
└── Dockerfile
```

### Docker Architecture
```yaml
services:
  postgres:          # PostgreSQL 18
    image: postgres:18-alpine
    environment: {...}
    volumes: [postgres_data]
    ports: ["5432:5432"]

  backend:           # Go API server
    build: ./invoicing-backend
    ports: ["8080:8080"]
    depends_on: [postgres]
    environment: {...}
    volumes: [./invoicing-backend:/app]

  frontend:          # React app (later phase)
    build: ./invoicing-frontend
    ports: ["3000:3000"]
    environment: {...}
```

### Simplified Local Development (Makefile)

**Streamlined development workflow** focused on local development:

```makefile
# Core Development Commands
make dev          # Start development server (requires PostgreSQL)
make build        # Build the Go application
make test         # Run tests
make clean        # Clean build artifacts

# Database Setup
make db-setup     # Setup PostgreSQL database (instructions)
make db-migrate   # Run database migrations
make docker-postgres  # Start PostgreSQL with Docker

# Quick Start
make setup        # Complete setup for new developers
make quick-start  # Quick development start with Docker PostgreSQL
make env-setup    # Create environment file

# Development Tools
make dev-hot      # Hot reload development (requires air)
make run          # Build and run application
```

**Simplified Approach**:
- **Local Development**: Direct Go development without Docker complexity
- **Optional Docker**: PostgreSQL via Docker for easy database setup
- **Environment Setup**: Automated .env file creation and database instructions
- **Quick Start**: One-command setup for new developers

## API Design Principles

### RESTful Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET/POST /api/clients` - Client management
- `GET/PUT/DELETE /api/clients/[id]` - Individual client
- `GET/POST /api/invoices` - Invoice management
- `GET/PUT/DELETE /api/invoices/[id]` - Individual invoice

### Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "VALIDATION_ERROR"
}
```

## Security Considerations

### Authentication
- JWT tokens with 24h expiration
- Password hashing with bcrypt
- Secure headers (CORS, security headers)

### Data Protection
- Input validation on all endpoints
- SQL injection prevention (GORM parameterized queries)
- HTTPS enforcement in production

## Development Workflow

### Immediate Next Actions
1. **Initialize Go Project**: Create module, basic structure
2. **Database Setup**: PostgreSQL connection, initial migration
3. **Authentication**: JWT middleware, register/login endpoints
4. **Client Management**: Full CRUD API
5. **Invoice Management**: Core CRUD with business logic
6. **Simplified Makefile**: Local development focused automation
7. **Quick Start Setup**: One-command development environment

### Code Quality Standards
- **Error Handling**: Comprehensive error responses
- **Validation**: Input validation with clear messages
- **Logging**: Structured logging for debugging
- **Testing**: Unit tests for critical business logic

### Success Metrics
- ✅ API endpoints respond < 200ms
- ✅ Database migrations run without errors
- ✅ Authentication flow works end-to-end
- ✅ CRUD operations functional for clients/invoices
- ✅ Local development setup works with `make setup`
- ✅ Backend builds successfully with `make build`

## Risk Assessment

### Technical Risks
- **Database Performance**: Monitor query performance, add indexes as needed
- **Docker Complexity**: Start simple, add complexity incrementally
- **Dependency Management**: Use stable, well-maintained packages

### Mitigation Strategies
- **Gradual Implementation**: Build incrementally, test each component
- **Health Checks**: Add endpoint monitoring and health checks
- **Documentation**: Keep API documentation current
- **Backup Plans**: Maintain ability to run without Docker if needed

## Troubleshooting

### Common Issues Resolved

**Docker Compose V2 Compatibility**:
- **Problem**: `make: docker-compose: No such file or directory`
- **Root Cause**: Docker Compose V2 uses `docker compose` instead of `docker-compose`
- **Solution**: Updated all Makefile commands to use `docker compose` syntax
- **Impact**: All make commands now work with modern Docker installations

**Go Version Mismatch**:
- **Problem**: `go.mod requires go >= 1.25.1 (running go 1.21.13)`
- **Root Cause**: go.mod specified non-existent Go version
- **Solution**: Corrected go.mod to use `go 1.21` and updated Dockerfile accordingly
- **Impact**: Docker builds now complete successfully

**Dependency Issues**:
- **Problem**: `go: updates to go.mod needed; to update it: go mod tidy`
- **Root Cause**: go.mod needed dependency updates during build
- **Solution**: Added `go mod tidy` step to Dockerfile build process
- **Impact**: Consistent builds across different environments

**Go Version Compatibility**:
- **Problem**: Dependencies require newer Go versions than available
- **Root Cause**: Latest dependency versions require Go 1.23+ but Docker uses Go 1.21
- **Solution**: Created Makefile.simple for local development without Docker complexity
- **Impact**: Development can proceed while Docker issues are resolved
- **Alternative**: Use `make dev-simple` for local Go development

**CORS Middleware Compatibility**:
- **Problem**: `undefined: cors.New` and incompatible CORS config
- **Root Cause**: jub0bs/cors package API changes and version incompatibilities
- **Solution**: Switched to gin-contrib/cors with compatible configuration
- **Impact**: CORS middleware now works correctly with Go 1.24
- **Result**: `make build` completes successfully

**Makefile Simplification**:
- **Problem**: Complex Docker-based Makefile causing development friction
- **Root Cause**: Docker Compose V2 issues and Go version conflicts
- **Solution**: Created simplified Makefile focused on local development
- **Impact**: Faster development workflow with `make setup` and `make dev`
- **Features**: PostgreSQL via Docker, automated environment setup, quick start

## Changelog
- **Created**: 2025-09-29 - Initial project brief for backend-first implementation
- **Updated**: 2025-09-29 - Docker implementation added to scope
- **Evolved**: 2025-09-29 - Added comprehensive Makefile for multi-environment deployment automation
- **Fixed**: 2025-09-29 - Resolved Docker Compose V2 compatibility and Go version issues in Makefile
- **Resolved**: 2025-09-29 - Fixed CORS middleware compatibility and created Makefile.simple for local development
- **Simplified**: 2025-09-29 - Streamlined Makefile for local development with automated setup and PostgreSQL Docker integration
