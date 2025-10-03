-- Remove user organization roles assignments
DELETE FROM user_organization_roles;

-- Remove default subscription
DELETE FROM subscriptions WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d998'::UUID;

-- Remove default organization
DELETE FROM organizations WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_organization_roles_assigned_by;
DROP INDEX IF EXISTS idx_user_organization_roles_role_id;
DROP INDEX IF EXISTS idx_user_organization_roles_organization_id;
DROP INDEX IF EXISTS idx_user_organization_roles_user_id;
DROP INDEX IF EXISTS idx_user_organization_roles_unique;

-- Drop user_organization_roles table
DROP TABLE IF EXISTS user_organization_roles;
