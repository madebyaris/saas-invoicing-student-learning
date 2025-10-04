-- Seed Demo Data for SaaS Invoicing System
-- This script creates 3 demo users, assigns RBAC roles, and creates 3 demo clients

BEGIN;

-- Insert demo users (passwords are hashed 'password123')
INSERT INTO users (id, email, password_hash, first_name, last_name, company_name, current_organization_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@acme.com', '$2a$10$zCGfgp1GizwWtTbwkQ7VpOsuVUZNs6nbdDqJYcWqGMmXnNhQWRiGq', 'John', 'Admin', 'ACME Corp', 'f47ac10b-58cc-4372-a567-0e02b2c3d999'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'user@acme.com', '$2a$10$zCGfgp1GizwWtTbwkQ7VpOsuVUZNs6nbdDqJYcWqGMmXnNhQWRiGq', 'Jane', 'User', 'ACME Corp', 'f47ac10b-58cc-4372-a567-0e02b2c3d999'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'viewer@acme.com', '$2a$10$zCGfgp1GizwWtTbwkQ7VpOsuVUZNs6nbdDqJYcWqGMmXnNhQWRiGq', 'Bob', 'Viewer', 'ACME Corp', 'f47ac10b-58cc-4372-a567-0e02b2c3d999')
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
INSERT INTO user_organization_roles (user_id, organization_id, role_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f47ac10b-58cc-4372-a567-0e02b2c3d999', 'f47ac10b-58cc-4372-a567-0e02b2c3d480'), -- org_admin
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f47ac10b-58cc-4372-a567-0e02b2c3d999', 'f47ac10b-58cc-4372-a567-0e02b2c3d481'), -- org_user
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f47ac10b-58cc-4372-a567-0e02b2c3d999', 'f47ac10b-58cc-4372-a567-0e02b2c3d482')  -- org_viewer
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- Insert demo clients
INSERT INTO clients (organization_id, user_id, name, email, company_name, address_line1, city, country, postal_code) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d999', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tech Solutions Inc', 'billing@techsolutions.com', 'Tech Solutions Inc', '123 Tech Street', 'San Francisco', 'USA', '94102'),
('f47ac10b-58cc-4372-a567-0e02b2c3d999', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Design Studio Co', 'accounts@designstudio.com', 'Design Studio Co', '456 Creative Ave', 'New York', 'USA', '10001'),
('f47ac10b-58cc-4372-a567-0e02b2c3d999', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Marketing Agency', 'finance@marketingagency.com', 'Marketing Agency', '789 Brand Blvd', 'Los Angeles', 'USA', '90001')
ON CONFLICT DO NOTHING;

COMMIT;

-- Display summary
SELECT '✅ Demo data seeded successfully!' as message;
SELECT 'Total Users: ' || COUNT(*)::text as summary FROM users;
SELECT 'Total Clients: ' || COUNT(*)::text as summary FROM clients;
SELECT 'Total Organizations: ' || COUNT(*)::text as summary FROM organizations;
SELECT 'Total Role Assignments: ' || COUNT(*)::text as summary FROM user_organization_roles;

