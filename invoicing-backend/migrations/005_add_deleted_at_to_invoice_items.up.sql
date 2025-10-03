-- Add deleted_at column to invoice_items table for soft delete functionality
-- This fixes the schema mismatch where InvoiceItem model includes Base struct
-- but the table was missing the deleted_at column

ALTER TABLE invoice_items ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Add index for deleted_at column (consistent with other tables using soft delete)
CREATE INDEX idx_invoice_items_deleted_at ON invoice_items(deleted_at);
