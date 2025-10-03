# Development stage
FROM golang:1.25-alpine AS development

WORKDIR /app

# Install necessary packages for development
RUN apk add --no-cache git ca-certificates tzdata wget

# Install Air for hot reload (latest version compatible with Go 1.25)
RUN go install github.com/air-verse/air@latest

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Expose port
EXPOSE 8080

# Default command for development (will be overridden by docker-compose)
CMD ["air", "-c", ".air.toml"]

# Build stage for production
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install necessary packages
RUN apk add --no-cache git ca-certificates tzdata

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Update dependencies and build the application
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/server/main.go

# Production stage
FROM alpine:3.18 AS production

# Install ca-certificates and wget for health checks
RUN apk --no-cache add ca-certificates tzdata wget

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Copy migrations
COPY --from=builder /app/migrations ./migrations

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./main"]
