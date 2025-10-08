import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { Invoice } from '@/types/invoice';
import type { Client } from '@/types/client';

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalClients: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueChange: number;
  invoicesThisMonth: number;
  invoicesLastMonth: number;
  invoicesChange: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch all necessary data
      const [invoicesRes, clientsRes] = await Promise.all([
        apiClient.get('/api/invoices'),
        apiClient.get('/api/clients'),
      ]);

      const invoices: Invoice[] = invoicesRes.data?.data?.invoices || [];
      const clients: Client[] = clientsRes.data?.data?.clients || [];

      // Calculate stats
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Total revenue (sum of all paid invoices)
      const totalRevenue = invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      // Status counts
      const paidInvoices = invoices.filter((inv) => inv.status === 'paid').length;
      const pendingInvoices = invoices.filter((inv) => inv.status === 'sent' || inv.status === 'draft').length;
      const overdueInvoices = invoices.filter((inv) => inv.status === 'overdue').length;

      // This month revenue
      const revenueThisMonth = invoices
        .filter((inv) => {
          const issueDate = new Date(inv.issue_date);
          return inv.status === 'paid' && issueDate >= firstDayThisMonth;
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      // Last month revenue
      const revenueLastMonth = invoices
        .filter((inv) => {
          const issueDate = new Date(inv.issue_date);
          return (
            inv.status === 'paid' &&
            issueDate >= firstDayLastMonth &&
            issueDate <= lastDayLastMonth
          );
        })
        .reduce((sum, inv) => sum + inv.total_amount, 0);

      // Revenue change percentage
      const revenueChange =
        revenueLastMonth > 0
          ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
          : 0;

      // Invoices this month
      const invoicesThisMonth = invoices.filter((inv) => {
        const issueDate = new Date(inv.issue_date);
        return issueDate >= firstDayThisMonth;
      }).length;

      // Invoices last month
      const invoicesLastMonth = invoices.filter((inv) => {
        const issueDate = new Date(inv.issue_date);
        return issueDate >= firstDayLastMonth && issueDate <= lastDayLastMonth;
      }).length;

      // Invoices change percentage
      const invoicesChange =
        invoicesLastMonth > 0
          ? ((invoicesThisMonth - invoicesLastMonth) / invoicesLastMonth) * 100
          : 0;

      return {
        totalRevenue,
        totalInvoices: invoices.length,
        totalClients: clients.length,
        paidInvoices,
        pendingInvoices,
        overdueInvoices,
        revenueThisMonth,
        revenueLastMonth,
        revenueChange,
        invoicesThisMonth,
        invoicesLastMonth,
        invoicesChange,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRecentInvoices = (limit: number = 10) => {
  return useQuery<Invoice[]>({
    queryKey: ['recent-invoices', limit],
    queryFn: async () => {
      const response = await apiClient.get(`/api/invoices?limit=${limit}`);
      return response.data?.data?.invoices || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
