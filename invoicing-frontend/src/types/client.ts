export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  tax_id?: string;
  created_at: string;
  updated_at: string;
}
