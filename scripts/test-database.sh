#!/bin/bash
# Quick Database Testing Script for RBAC System

echo "🗄️  Running Database Validation for RBAC System..."
echo "================================================="

# Copy SQL script to container and run it
docker compose cp scripts/test-database-validation.sql postgres:/tmp/test-database-validation.sql
docker compose exec postgres psql -U postgres -d invoicing -f /tmp/test-database-validation.sql

echo ""
echo "💡 To run this manually:"
echo "   docker compose exec postgres psql -U postgres -d invoicing"
echo "   Then run SQL queries from scripts/test-database-validation.sql"
