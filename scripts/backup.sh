#!/bin/bash

# Invoicing SaaS - Database Backup Script
# Usage: ./scripts/backup.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "💾 Creating database backup for $ENVIRONMENT..."

# Check if environment is valid
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables
if [[ -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]]; then
    source "$PROJECT_ROOT/.env.$ENVIRONMENT"
fi

# Set database URL based on environment
if [[ "$ENVIRONMENT" == "production" ]]; then
    DB_CONTAINER="invoicing-postgres"
    BACKUP_FILE="$BACKUP_DIR/prod_backup_$TIMESTAMP.sql"
else
    DB_CONTAINER="invoicing-staging-postgres"
    BACKUP_FILE="$BACKUP_DIR/staging_backup_$TIMESTAMP.sql"
fi

echo "📦 Creating backup: $BACKUP_FILE"

# Create the backup
if docker ps | grep -q "$DB_CONTAINER"; then
    echo "🐳 Database container found, creating backup..."
    docker exec "$DB_CONTAINER" pg_dump -U postgres invoicing > "$BACKUP_FILE"

    # Compress the backup
    echo "🗜️  Compressing backup..."
    gzip "$BACKUP_FILE"

    echo "✅ Backup completed successfully!"
    echo "📄 Compressed backup: ${BACKUP_FILE}.gz"
    echo "📊 Size: $(du -h "${BACKUP_FILE}.gz" | cut -f1)"

    # Clean up old backups (keep last 7 days)
    echo "🧹 Cleaning up old backups..."
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +7 -delete

    echo "✅ Cleanup completed"
    echo ""
    echo "📋 Backup Summary:"
    ls -lh "$BACKUP_DIR"/*.gz | tail -5

else
    echo "❌ Database container '$DB_CONTAINER' not found"
    echo "💡 Make sure the $ENVIRONMENT environment is running"
    exit 1
fi
