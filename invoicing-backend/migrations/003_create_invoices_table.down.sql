DROP INDEX IF EXISTS idx_invoices_deleted_at;
DROP INDEX IF EXISTS idx_invoices_due_date;
DROP INDEX IF EXISTS idx_invoices_status;
DROP INDEX IF EXISTS idx_invoices_client_id;
DROP INDEX IF EXISTS idx_invoices_user_invoice_number;
DROP TABLE IF EXISTS invoices;
DROP TYPE IF EXISTS invoice_status;
