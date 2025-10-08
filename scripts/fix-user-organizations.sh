#!/bin/bash

# Script to fix existing users without organizations
# This creates organizations, roles, and subscriptions for users who registered before the fix

set -e

echo "🔧 Fixing user organizations..."

# Run Go script to fix users
cd "$(dirname "$0")/../invoicing-backend"

go run scripts/fix_user_organizations.go

echo "✅ User organizations fixed!"
