import React from 'react';
import { createRouter, Outlet, RouterProvider, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getToken } from './lib/auth';
import { Loading } from './components/ui/loading';

// Lazy load pages for better code splitting
const LoginPage = React.lazy(() => import('./app/login').then(m => ({ default: m.LoginPage })));
const DashboardPage = React.lazy(() => import('./app/dashboard'));
const DashboardLayout = React.lazy(() => import('./components/layout/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const ClientsPage = React.lazy(() => import('./app/clients'));
const InvoicesPage = React.lazy(() => import('./app/invoices'));
const SettingsPage = React.lazy(() => import('./app/settings'));
const PaymentsPage = React.lazy(() => import('./app/payments'));
const AnalyticsPage = React.lazy(() => import('./app/analytics'));
const InvoiceDetailPage = React.lazy(() => import('./app/invoice-detail'));
const ClientDetailPage = React.lazy(() => import('./app/client-detail'));

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <React.Suspense fallback={<Loading fullScreen text="Loading application..." />}>
        <Outlet />
      </React.Suspense>
    </QueryClientProvider>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: async () => {
    // Redirect authenticated users to dashboard
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = getToken();
    if (token) {
      throw redirect({ to: '/dashboard' });
    }
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => {
    // Always redirect to dashboard, which will handle auth check
    return redirect({ to: '/dashboard' });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardLayout,
  beforeLoad: async () => {
    // Sync auth check with a small delay to ensure token is stored
    await new Promise(resolve => setTimeout(resolve, 100));
    const token = getToken();
    if (!token) {
      throw redirect({ to: '/login' });
    }
  },
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: '/',
  component: DashboardPage,
});

// Placeholder routes for sidebar links
const invoicesRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'invoices',
  component: InvoicesPage,
});

const clientsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'clients',
  component: ClientsPage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'payments',
  component: PaymentsPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'analytics',
  component: AnalyticsPage,
});

// Detail routes with parameters
const invoiceDetailRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'invoices/$invoiceId',
  component: InvoiceDetailPage,
});

const clientDetailRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'clients/$clientId',
  component: ClientDetailPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: 'settings',
  component: SettingsPage,
});


const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute.addChildren([
    dashboardIndexRoute,
    invoicesRoute,
    clientsRoute,
    paymentsRoute,
    analyticsRoute,
    settingsRoute,
    invoiceDetailRoute,
    clientDetailRoute,
  ]),
]);

const router = createRouter({ routeTree });

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
