#!/bin/bash

# Invoicing SaaS - Production Deployment Script
# Usage: ./scripts/deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying Invoicing SaaS to $ENVIRONMENT..."

# Check if environment is valid
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]]; then
    source "$PROJECT_ROOT/.env.$ENVIRONMENT"
    echo "✅ Loaded $ENVIRONMENT environment configuration"
else
    echo "⚠️  No .env.$ENVIRONMENT file found, using system environment variables"
fi

# Create necessary directories
echo "📁 Creating directories..."
sudo mkdir -p /opt/invoicing-$ENVIRONMENT
sudo mkdir -p /opt/invoicing-$ENVIRONMENT/postgres

# Copy docker-compose and environment files
echo "📋 Copying configuration files..."
cp "$PROJECT_ROOT/docker-compose.yml" "/opt/invoicing-$ENVIRONMENT/"
cp "$PROJECT_ROOT/docker-compose.$ENVIRONMENT.yml" "/opt/invoicing-$ENVIRONMENT/"

# Create environment file for docker-compose
cat > "/opt/invoicing-$ENVIRONMENT/.env" << EOF
DATABASE_URL=${DATABASE_URL:-postgres://postgres:${POSTGRES_PASSWORD:-password}@postgres:5432/invoicing?sslmode=disable}
JWT_SECRET=${JWT_SECRET:-your-super-secret-jwt-key-change-in-production}
GIN_MODE=release
EOF

# Set proper ownership
sudo chown -R $(whoami):$(whoami) /opt/invoicing-$ENVIRONMENT

# Navigate to deployment directory
cd "/opt/invoicing-$ENVIRONMENT"

# Pull latest images and deploy
echo "🐳 Deploying services..."
docker-compose pull
docker-compose down || true
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run health checks
echo "💊 Running health checks..."
if curl -f "http://localhost:8080/health" > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T backend sh -c 'if [ -f "./main" ]; then ./main migrate; else echo "Migration command not available"; fi'

echo "🎉 Deployment to $ENVIRONMENT completed successfully!"
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""
echo "🔗 Access URLs:"
echo "   Application: http://localhost:8080"
echo "   Health:      http://localhost:8080/health"