import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional(),
  company_name: z.string().max(255).optional(),
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  tax_id: z.string().max(50).optional(),
});

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.coerce.number().min(0.001, 'Quantity must be greater than 0'),
  unit_price: z.coerce.number().min(0, 'Unit price must be 0 or greater'),
  total_price: z.coerce.number().min(0, 'Total price must be 0 or greater').optional(),
});

export const invoiceSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  currency: z.string().min(3).max(3).default('USD'),
  tax_rate: z.coerce.number().min(0).max(1).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  invoice_items: z
    .array(invoiceItemSchema)
    .min(1, 'Add at least one line item'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ClientFormData = z.infer<typeof clientSchema>;
export type InvoiceFormData = z.infer<typeof invoiceSchema>;
