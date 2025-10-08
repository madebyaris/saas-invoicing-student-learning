import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { Client } from '@/types/client';
import { clientSchema } from '@/lib/validations';

interface CreateClientPayload {
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
}

const normalizeClientsResponse = (data: any): Client[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ('clients' in data) return data.clients;
  if ('data' in data && Array.isArray(data.data)) return data.data;
  return [];
};

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiClient.get('/api/clients');
      return normalizeClientsResponse(response.data?.data ?? response.data);
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateClientPayload) => {
      const parsed = await clientSchema.safeParseAsync(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid client data');
      }

      const response = await apiClient.post('/api/clients', payload);
      return response.data?.data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: CreateClientPayload & { id: string }) => {
      const parsed = await clientSchema.safeParseAsync(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Invalid client data');
      }

      const response = await apiClient.put(`/api/clients/${id}`, payload);
      return response.data?.data as Client;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/clients/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', id] });
    },
  });
};

