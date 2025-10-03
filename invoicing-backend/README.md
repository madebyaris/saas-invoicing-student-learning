# Invoicing SaaS Backend

A modern Go-based REST API for invoicing management, built with Gin framework and PostgreSQL.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Client Management**: Full CRUD operations for client records
- **Invoice Management**: Complete invoice lifecycle management
- **Database Migrations**: Automated schema management with golang-migrate
- **Docker Support**: Containerized deployment with Docker Compose

## Tech Stack

- **Go 1.21+**: Modern Go programming language
- **Gin**: High-performance HTTP web framework
- **GORM**: ORM library for database operations
- **PostgreSQL 18**: Robust relational database
- **JWT**: JSON Web Token authentication
- **Viper**: Configuration management
- **golang-migrate**: Database migration tool

## Quick Start

> **🐳 Docker-First Development (Recommended)**
> 
> This project uses a Docker-first approach. See [README-DOCKER.md](../README-DOCKER.md) for the complete Docker development guide.

### Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose V2

### Docker Development (Recommended)

1. **One-command setup:**
   ```bash
   make setup
   ```

2. **Start development:**
   ```bash
   make dev          # Full development stack
   make dev-backend  # Backend services only
   ```

3. **View logs:**
   ```bash
   make logs
   ```

4. **Health check:**
   ```bash
   curl http://localhost:8080/health
   ```

The API will be available at `http://localhost:8080`

### Local Development (Legacy)

> **⚠️ Note**: Local development requires manual setup of Go and PostgreSQL. Docker development is recommended for consistency.

<details>
<summary>Click to expand local development instructions</summary>

#### Prerequisites
- Go 1.21 or higher
- PostgreSQL 18

#### Setup Steps

1. **Clone and setup:**
   ```bash
   cd invoicing-backend
   go mod tidy
   ```

2. **Environment variables:**
   Create a `.env` file with:
   ```env
   DATABASE_URL=postgres://postgres:password@localhost:5432/invoicing?sslmode=disable
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=8080
   GIN_MODE=debug
   ```

3. **Run database migrations:**
   ```bash
   # Install golang-migrate if not already installed
   go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

   # Run migrations
   migrate -path migrations -database "$DATABASE_URL" up
   ```

4. **Start the server:**
   ```bash
   go run cmd/server/main.go
   ```

</details>

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication

### Clients
- `POST /api/clients` - Create client
- `GET /api/clients` - List user's clients
- `GET /api/clients/:id` - Get client details
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - List user's invoices
- `GET /api/invoices/:id` - Get invoice details
- `PUT /api/invoices/:id` - Update invoice
- `PUT /api/invoices/:id/status` - Update invoice status
- `DELETE /api/invoices/:id` - Delete invoice

## Project Structure

```
invoicing-backend/
├── cmd/server/
│   └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go          # Configuration management
│   ├── database/
│   │   ├── connection.go      # Database connection
│   │   └── migrations.go      # Migration runner
│   ├── models/
│   │   ├── base.go           # Base model
│   │   ├── user.go           # User model
│   │   ├── client.go         # Client model
│   │   └── invoice.go        # Invoice models
│   ├── handlers/
│   │   ├── auth.go           # Auth handlers
│   │   ├── client.go         # Client handlers
│   │   └── invoice.go        # Invoice handlers
│   ├── middleware/
│   │   ├── auth.go           # JWT middleware
│   │   └── cors.go           # CORS middleware
│   ├── services/
│   │   ├── auth.go           # Auth business logic
│   │   ├── client.go         # Client business logic
│   │   └── invoice.go        # Invoice business logic
│   └── utils/
│       ├── jwt.go            # JWT utilities
│       ├── password.go       # Password utilities
│       └── response.go       # Response utilities
├── migrations/               # SQL migration files
├── Dockerfile               # Container definition
└── README.md
```

## Development

### Docker-First Workflow

All development commands use Docker containers:

```bash
make dev         # Start development with hot reload
make test        # Run tests in container
make lint        # Run linting in container
make shell       # Access container shell
make db-migrate  # Run migrations
```

See [README-DOCKER.md](../README-DOCKER.md) for complete Docker development guide.

### Adding New Features

1. **Models**: Add new structs in `internal/models/`
2. **Migrations**: Create migration files in `migrations/`
3. **Services**: Implement business logic in `internal/services/`
4. **Handlers**: Create HTTP handlers in `internal/handlers/`
5. **Routes**: Add routes in `cmd/server/main.go`

### Testing

**Docker (Recommended):**
```bash
make test        # Run tests in container
make test-watch  # Run tests with watch mode
```

**Local:**
```bash
go test ./...
```

### Building

**Docker (Recommended):**
```bash
make build-prod  # Build production image
```

**Local:**
```bash
go build -o bin/server cmd/server/main.go
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- CORS is properly configured for frontend access
- Input validation is performed on all endpoints
- SQL injection protection via GORM parameterized queries

## Production Deployment

1. **Environment variables**: Set secure production values
2. **Database**: Use a production PostgreSQL instance
3. **HTTPS**: Configure SSL/TLS certificates
4. **Monitoring**: Add health checks and logging
5. **Backups**: Implement database backup strategy

## License

This project is part of the Invoicing SaaS application.
