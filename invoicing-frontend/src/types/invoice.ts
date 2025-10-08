export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  terms?: string;
  created_at: string;
  updated_at: string;
  client?: import('./client').Client;
  invoice_items?: InvoiceItem[];
}
