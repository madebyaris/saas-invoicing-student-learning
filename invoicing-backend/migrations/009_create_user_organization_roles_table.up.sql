-- Create user_organization_roles junction table for RBAC system
CREATE TABLE user_organization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure one role per user per organization (users can have different roles in different orgs)
CREATE UNIQUE INDEX idx_user_organization_roles_unique ON user_organization_roles(user_id, organization_id);

-- Indexes for performance
CREATE INDEX idx_user_organization_roles_user_id ON user_organization_roles(user_id);
CREATE INDEX idx_user_organization_roles_organization_id ON user_organization_roles(organization_id);
CREATE INDEX idx_user_organization_roles_role_id ON user_organization_roles(role_id);
CREATE INDEX idx_user_organization_roles_assigned_by ON user_organization_roles(assigned_by);

-- Create a default organization for existing data migration
INSERT INTO organizations (id, name, subdomain, settings) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID,
    'Default Organization',
    'default',
    '{"is_default": true, "created_during_migration": true}'
);

-- Create a default subscription for the default organization (free plan)
INSERT INTO subscriptions (
    id,
    organization_id, 
    plan_type, 
    status,
    monthly_invoice_limit,
    monthly_client_limit,
    monthly_user_limit,
    current_period_start,
    current_period_end
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d998'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID,
    'free',
    'active',
    5,
    2,
    1,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 month'
);

-- Migrate existing users to default organization with org_admin role (first user) or org_user role (others)
WITH numbered_users AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as user_rank
    FROM users
)
INSERT INTO user_organization_roles (user_id, organization_id, role_id)
SELECT 
    u.id,
    'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID,
    CASE 
        WHEN nu.user_rank = 1 THEN 'f47ac10b-58cc-4372-a567-0e02b2c3d480'::UUID -- org_admin for first user
        ELSE 'f47ac10b-58cc-4372-a567-0e02b2c3d481'::UUID -- org_user for others
    END
FROM users u
JOIN numbered_users nu ON u.id = nu.id;
