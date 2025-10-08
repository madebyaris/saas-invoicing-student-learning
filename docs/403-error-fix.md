# 403 Error Fix - Organization Setup

## Problem

Users were experiencing 403 (Forbidden) errors when trying to access any protected endpoints (clients, invoices, dashboard) after logging in.

## Root Cause

The backend uses a comprehensive RBAC (Role-Based Access Control) system that requires:
1. **JWT Authentication** - User must be authenticated
2. **Organization Context** - User must belong to an organization
3. **Active Subscription** - Organization must have an active subscription
4. **Proper Permissions** - User's role must have the required permissions

The registration process was only creating users but NOT:
- Creating an organization for them
- Assigning them to an organization with a role
- Creating a subscription for the organization

This caused the `OrganizationContextMiddleware` to return 403 errors because users had no organization membership.

## Solution

### 1. Updated Registration Service

**File**: `invoicing-backend/internal/services/auth.go`

Enhanced the `Register` function to automatically:
- Create a default organization for new users (named "{FirstName} {LastName}'s Organization")
- Get or create the `org_admin` role with full permissions
- Assign the user to the organization with the `org_admin` role
- Create a free subscription with limits:
  - 10 invoices per month
  - 50 clients
  - 3 users

All operations are wrapped in a database transaction to ensure atomicity.

### 2. Migration Script for Existing Users

**File**: `invoicing-backend/scripts/fix_user_organizations.go`

Created a migration script that:
- Finds all users without organization membership
- Creates organizations for them
- Assigns them the `org_admin` role
- Creates free subscriptions
- Updates existing clients and invoices to belong to the new organization

**Usage**:
```bash
docker compose exec backend go run scripts/fix_user_organizations.go
```

### 3. Fixed GORM Column Naming

**File**: `invoicing-backend/internal/models/subscription.go`

Fixed column name mismatch:
- Database: `paypal_subscription_id`, `paypal_plan_id` (snake_case)
- Model: `PayPalSubscriptionID`, `PayPalPlanID` (PascalCase)

Added explicit column tags:
```go
PayPalSubscriptionID string `json:"paypal_subscription_id" gorm:"column:paypal_subscription_id;size:255;index"`
PayPalPlanID         string `json:"paypal_plan_id" gorm:"column:paypal_plan_id;size:255"`
```

## Results

✅ All users now have:
- An organization they belong to
- The `org_admin` role with full permissions
- An active free subscription

✅ No more 403 errors on protected endpoints

✅ Users can now:
- View and manage clients
- Create and manage invoices
- Access the dashboard
- Use all application features

## Testing

1. **New User Registration**:
   ```bash
   curl -X POST http://localhost:8080/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "newuser@example.com",
       "password": "password123",
       "first_name": "New",
       "last_name": "User"
     }'
   ```
   
   Should automatically create organization and subscription.

2. **Existing Users**:
   ```bash
   docker compose exec backend go run scripts/fix_user_organizations.go
   ```
   
   Should fix all users without organizations.

3. **Verify Access**:
   - Login with any user
   - Navigate to `/dashboard/clients`
   - Should see the clients page without 403 errors

## Architecture Notes

### RBAC Middleware Chain

Protected routes use this middleware chain:
1. `JWTAuthMiddleware()` - Validates JWT token
2. `OrganizationContextMiddleware()` - Extracts organization context
3. `RequireActiveSubscription()` - Validates subscription
4. `RequirePermission()` - Checks specific permissions

### Organization Context

The `OrganizationContextMiddleware` sets these context variables:
- `organization_id` - Current organization ID
- `user_role` - User's role name
- `role_permissions` - User's permissions
- `user_org_role` - Full UserOrganizationRole object

### Default Permissions for org_admin

```go
{
  Organization: []string{"read", "update"},
  Users:        []string{"manage"}, // Full CRUD
  Invoices:     []string{"manage"}, // Full CRUD
  Clients:      []string{"manage"}, // Full CRUD
  Subscription: []string{"read", "update"},
}
```

## Future Improvements

1. **Multi-Organization Support**: Allow users to belong to multiple organizations
2. **Organization Invitations**: Allow admins to invite users to their organization
3. **Custom Roles**: Allow organizations to create custom roles
4. **Subscription Management**: Implement upgrade/downgrade flows
5. **Usage Tracking**: Track and enforce subscription limits

## Related Files

- `invoicing-backend/internal/services/auth.go` - Registration logic
- `invoicing-backend/internal/middleware/rbac.go` - RBAC middleware
- `invoicing-backend/internal/models/organization.go` - Organization model
- `invoicing-backend/internal/models/subscription.go` - Subscription model
- `invoicing-backend/internal/models/role.go` - Role and permissions
- `invoicing-backend/scripts/fix_user_organizations.go` - Migration script
- `specs/active/full-app-pages/feature-brief.md` - Feature documentation
