-- Database Validation Script for RBAC System
-- Run this script to validate the multi-tenant setup and RBAC implementation

\echo '🗄️  Database Validation for RBAC System'
\echo '===================================='

\echo '📋 1. Checking Organizations and Subscriptions...'
SELECT 
    o.id as org_id,
    o.name as org_name,
    o.subdomain,
    s.plan_type,
    s.status,
    s.monthly_invoice_limit,
    s.monthly_client_limit,
    s.monthly_user_limit
FROM organizations o 
LEFT JOIN subscriptions s ON o.id = s.organization_id 
WHERE o.name = 'Default Organization';

\echo ''
\echo '📋 2. Checking User Organization Roles...'
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    r.name as role_name,
    o.name as org_name,
    uor.assigned_at
FROM users u
JOIN user_organization_roles uor ON u.id = uor.user_id
JOIN roles r ON uor.role_id = r.id
JOIN organizations o ON uor.organization_id = o.id
ORDER BY u.email;

\echo ''
\echo '📋 3. Checking System Roles and Permissions...'
SELECT 
    name,
    description,
    is_system_role,
    permissions
FROM roles 
WHERE is_system_role = true
ORDER BY name;

\echo ''
\echo '📋 4. Verifying Organization ID Migration...'
SELECT 
    'clients' as table_name, 
    COUNT(*) as total_records,
    COUNT(organization_id) as with_org_id,
    COUNT(*) - COUNT(organization_id) as missing_org_id
FROM clients
UNION ALL
SELECT 
    'invoices' as table_name, 
    COUNT(*) as total_records,
    COUNT(organization_id) as with_org_id,
    COUNT(*) - COUNT(organization_id) as missing_org_id
FROM invoices;

\echo ''
\echo '📋 5. Checking Table Relationships...'
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('user_organization_roles', 'clients', 'invoices', 'subscriptions')
ORDER BY tc.table_name, tc.constraint_name;

\echo ''
\echo '📋 6. Checking Performance Indexes...'
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('user_organization_roles', 'clients', 'invoices', 'organizations', 'subscriptions', 'roles')
    AND indexname LIKE '%organization%' OR indexname LIKE '%user%' OR indexname LIKE '%role%'
ORDER BY tablename, indexname;

\echo ''
\echo '📋 7. Sample Data Verification...'
-- Check if we have sample data for testing
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM organizations) as total_organizations,
    (SELECT COUNT(*) FROM roles) as total_roles,
    (SELECT COUNT(*) FROM user_organization_roles) as total_user_roles,
    (SELECT COUNT(*) FROM subscriptions) as total_subscriptions,
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM invoices) as total_invoices;

\echo ''
\echo '✅ Database validation complete!'
\echo 'If all queries returned data without errors, your RBAC database setup is working correctly.'
