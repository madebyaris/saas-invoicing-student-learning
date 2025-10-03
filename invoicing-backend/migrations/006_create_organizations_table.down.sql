-- Drop organizations table indexes and table
DROP INDEX IF EXISTS idx_organizations_name;
DROP INDEX IF EXISTS idx_organizations_deleted_at;
DROP INDEX IF EXISTS idx_organizations_subdomain;
DROP TABLE IF EXISTS organizations;


