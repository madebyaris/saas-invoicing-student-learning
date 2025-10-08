import { useDashboardStats, useRecentInvoices } from '@/lib/hooks/useDashboard';
import { useClients } from '@/lib/hooks/useClients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  FileText, 
  Users, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';

export default function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentInvoices = [], isLoading: invoicesLoading } = useRecentInvoices(20);
  const { data: clients = [], isLoading: clientsLoading } = useClients();

  const isLoading = statsLoading || invoicesLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Analytics</h3>
          <p className="text-gray-600">There was an error loading the analytics data.</p>
        </div>
      </div>
    );
  }

  // Calculate additional metrics
  const averageInvoiceValue = stats.totalInvoices > 0 ? stats.totalRevenue / stats.totalInvoices : 0;
  const paymentRate = stats.totalInvoices > 0 ? (stats.paidInvoices / stats.totalInvoices) * 100 : 0;
  
  // Generate chart data for revenue trend (last 6 months)
  const monthlyRevenue = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthInvoices = recentInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.issue_date);
      return invoiceDate.getMonth() === date.getMonth() && 
             invoiceDate.getFullYear() === date.getFullYear() &&
             invoice.status === 'paid';
    });
    const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    monthlyRevenue.push({
      month: format(date, 'MMM'),
      revenue: revenue,
      invoices: monthInvoices.length
    });
  }

  // Client distribution by status
  const clientStats = {
    total: clients.length,
    active: clients.filter(client => {
      const clientInvoices = recentInvoices.filter(inv => inv.client_id === client.id);
      return clientInvoices.length > 0;
    }).length,
    new: clients.filter(client => {
      const createdDate = new Date(client.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              {stats.revenueChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats.revenueChange).toFixed(1)}%
              </span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              {stats.invoicesChange >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={stats.invoicesChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats.invoicesChange).toFixed(1)}%
              </span>
              <span>vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-gray-600">
              {clientStats.active} active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <PieChart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-600">
              {stats.paidInvoices} of {stats.totalInvoices} paid
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenue.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm font-medium">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${month.revenue.toFixed(2)}</div>
                    <div className="text-xs text-gray-600">{month.invoices} invoices</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
            <CardDescription>Distribution of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Paid</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.paidInvoices}</div>
                  <div className="text-xs text-gray-600">
                    {stats.totalInvoices > 0 ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.pendingInvoices}</div>
                  <div className="text-xs text-gray-600">
                    {stats.totalInvoices > 0 ? ((stats.pendingInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.overdueInvoices}</div>
                  <div className="text-xs text-gray-600">
                    {stats.totalInvoices > 0 ? ((stats.overdueInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Invoice Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageInvoiceValue.toFixed(2)}</div>
            <p className="text-xs text-gray-600">Per invoice</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue</span>
                <span className="font-semibold">${stats.revenueThisMonth.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoices</span>
                <span className="font-semibold">{stats.invoicesThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Clients</span>
                <span className="font-semibold">{clientStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New This Month</span>
                <span className="font-semibold">{clientStats.new}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest invoice activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInvoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-600">{invoice.client?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {invoice.status}
                    </Badge>
                    <span className="font-semibold">${invoice.total_amount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
