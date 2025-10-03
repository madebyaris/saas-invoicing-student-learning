-- Create roles table for RBAC system
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system roles
INSERT INTO roles (id, name, description, permissions, is_system_role) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', 
    'platform_admin', 
    'Platform administrator with system-wide access',
    '{"organizations": ["create", "read", "update", "delete"], "users": ["create", "read", "update", "delete"], "subscriptions": ["create", "read", "update", "delete"], "invoices": ["read", "update", "delete"], "clients": ["read", "update", "delete"]}',
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d480', 
    'org_admin', 
    'Organization administrator with full access within organization',
    '{"organization": ["read", "update"], "users": ["create", "read", "update", "delete"], "invoices": ["create", "read", "update", "delete"], "clients": ["create", "read", "update", "delete"], "subscription": ["read", "update"]}',
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d481', 
    'org_user', 
    'Organization user with limited access to create and manage own content',
    '{"invoices": ["create", "read", "update"], "clients": ["create", "read", "update"], "own_invoices": ["delete"], "own_clients": ["delete"]}',
    true
),
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d482', 
    'org_viewer', 
    'Organization viewer with read-only access',
    '{"invoices": ["read"], "clients": ["read"]}',
    true
);

-- Indexes for performance
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_system_role ON roles(is_system_role);


