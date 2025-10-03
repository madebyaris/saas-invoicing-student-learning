-- Rollback migration: Remove deleted_at column from invoice_items table

-- Remove index for deleted_at column
DROP INDEX IF EXISTS idx_invoice_items_deleted_at;

-- Remove deleted_at column from invoice_items table
ALTER TABLE invoice_items DROP COLUMN IF EXISTS deleted_at;
