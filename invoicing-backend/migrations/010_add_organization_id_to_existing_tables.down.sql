-- Drop indexes for users
DROP INDEX IF EXISTS idx_users_current_organization_id;

-- Remove current_organization_id from users table
ALTER TABLE users DROP COLUMN IF EXISTS current_organization_id;

-- Drop composite indexes
DROP INDEX IF EXISTS idx_invoices_organization_created;
DROP INDEX IF EXISTS idx_invoices_organization_status;
DROP INDEX IF EXISTS idx_invoices_organization_user;
DROP INDEX IF EXISTS idx_clients_organization_user;

-- Drop performance indexes
DROP INDEX IF EXISTS idx_invoices_organization_id;
DROP INDEX IF EXISTS idx_clients_organization_id;

-- Remove organization_id columns
ALTER TABLE invoices DROP COLUMN IF EXISTS organization_id;
ALTER TABLE clients DROP COLUMN IF EXISTS organization_id;
