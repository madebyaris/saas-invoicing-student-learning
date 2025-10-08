import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Invoice } from '@/types/invoice';

export interface UseInvoicesOptions {
  search?: string;
  status?: string;
}

interface InvoicesApiResponse {
  invoices: Invoice[];
}

interface InvoiceApiResponse {
  invoice: Invoice;
}

const getInvoices = async (options: UseInvoicesOptions = {}) => {
  const params: Record<string, string> = {};
  if (options.search) params.search = options.search;
  if (options.status && options.status !== 'all') params.status = options.status;

  const response = await apiClient.get('/api/invoices', { params });
  const data = response.data?.data as Invoice[] | InvoicesApiResponse | undefined;

  if (Array.isArray(data)) {
    return data;
  }

  if (data && 'invoices' in data) {
    return data.invoices;
  }

  return [];
};

export const useInvoices = (options: UseInvoicesOptions = {}) => {
  return useQuery({
    queryKey: ['invoices', options],
    queryFn: () => getInvoices(options),
  });
};

const getInvoice = async (invoiceId: string) => {
  const response = await apiClient.get(`/api/invoices/${invoiceId}`);
  const data = response.data?.data as Invoice | InvoiceApiResponse | undefined;

  if (data && 'invoice' in (data as InvoiceApiResponse)) {
    return (data as InvoiceApiResponse).invoice;
  }

  return data as Invoice | undefined;
};

export const useInvoice = (invoiceId?: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoice(invoiceId ?? ''),
    enabled: !!invoiceId,
  });
};

interface CreateInvoicePayload {
  client_id: string;
  issue_date: string;
  due_date: string;
  currency: string;
  tax_rate: number;
  notes?: string;
  terms?: string;
  invoice_items: Array<{
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price?: number;
  }>;
}

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInvoicePayload) => {
      const response = await apiClient.post('/api/invoices', payload);
      return response.data?.data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      await apiClient.delete(`/api/invoices/${invoiceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; status: Invoice['status'] }) => {
      await apiClient.post(`/api/invoices/${payload.id}/status`, {
        status: payload.status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

