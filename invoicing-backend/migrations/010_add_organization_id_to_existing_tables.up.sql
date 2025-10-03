-- Add organization_id to clients table
ALTER TABLE clients ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to invoices table  
ALTER TABLE invoices ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Update existing clients to belong to default organization
UPDATE clients SET organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID
WHERE organization_id IS NULL;

-- Update existing invoices to belong to default organization
UPDATE invoices SET organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after data migration
ALTER TABLE clients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE invoices ALTER COLUMN organization_id SET NOT NULL;

-- Add indexes for performance (critical for multi-tenant queries)
CREATE INDEX idx_clients_organization_id ON clients(organization_id);
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);

-- Add composite indexes for common query patterns
CREATE INDEX idx_clients_organization_user ON clients(organization_id, user_id);
CREATE INDEX idx_invoices_organization_user ON invoices(organization_id, user_id);
CREATE INDEX idx_invoices_organization_status ON invoices(organization_id, status);
CREATE INDEX idx_invoices_organization_created ON invoices(organization_id, created_at DESC);

-- Add current_organization_id to users table for session management
ALTER TABLE users ADD COLUMN current_organization_id UUID REFERENCES organizations(id);

-- Set current organization for existing users to default organization
UPDATE users SET current_organization_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d999'::UUID
WHERE current_organization_id IS NULL;

-- Add index for current organization lookup
CREATE INDEX idx_users_current_organization_id ON users(current_organization_id);
