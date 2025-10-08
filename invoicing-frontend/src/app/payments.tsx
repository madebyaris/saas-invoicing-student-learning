import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function PaymentsPage() {
  // TODO: Implement payments API integration when backend endpoints are available
  // This page currently shows a placeholder with mock data structure

  const mockPayments = [
    {
      id: '1',
      invoiceId: 'INV-001',
      invoiceNumber: 'INV-001',
      clientName: 'Acme Corp',
      amount: 2500.00,
      currency: 'USD',
      status: 'completed',
      method: 'credit_card',
      processedAt: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-15T10:25:00Z',
    },
    {
      id: '2',
      invoiceId: 'INV-002',
      invoiceNumber: 'INV-002',
      clientName: 'Tech Solutions Inc',
      amount: 1800.00,
      currency: 'USD',
      status: 'pending',
      method: 'bank_transfer',
      processedAt: null,
      createdAt: '2024-01-14T14:20:00Z',
    },
    {
      id: '3',
      invoiceId: 'INV-003',
      invoiceNumber: 'INV-003',
      clientName: 'Global Enterprises',
      amount: 3200.00,
      currency: 'USD',
      status: 'failed',
      method: 'credit_card',
      processedAt: null,
      createdAt: '2024-01-13T09:15:00Z',
    },
  ];

  const statusConfig = {
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  };

  const methodConfig = {
    credit_card: { label: 'Credit Card', icon: CreditCard },
    bank_transfer: { label: 'Bank Transfer', icon: DollarSign },
    paypal: { label: 'PayPal', icon: CreditCard },
  };

  const totalAmount = mockPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = mockPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Track and manage payment transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled>
            <CreditCard className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
          <Button disabled>
            <DollarSign className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-600">
              {mockPayments.filter(p => p.status === 'completed').length} completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-gray-600">
              {mockPayments.filter(p => p.status === 'pending').length} pending payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((mockPayments.filter(p => p.status === 'completed').length / mockPayments.length) * 100)}%
            </div>
            <p className="text-xs text-gray-600">
              Payment success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>
            Track all payment transactions and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPayments.map((payment) => {
              const StatusIcon = statusConfig[payment.status as keyof typeof statusConfig]?.icon || Clock;
              const statusColor = statusConfig[payment.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800';
              const MethodIcon = methodConfig[payment.method as keyof typeof methodConfig]?.icon || CreditCard;
              const methodLabel = methodConfig[payment.method as keyof typeof methodConfig]?.label || payment.method;

              return (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MethodIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{payment.invoiceNumber}</h3>
                        <Badge className={statusColor}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[payment.status as keyof typeof statusConfig]?.label || payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{payment.clientName}</p>
                      <p className="text-xs text-gray-500">
                        {methodLabel} • {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${payment.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{payment.currency}</p>
                    {payment.processedAt && (
                      <p className="text-xs text-gray-500">
                        Processed: {new Date(payment.processedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TODO Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Backend Integration Required</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This page displays mock data. To enable real payment tracking, implement the following backend endpoints:
                </p>
                <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                  <li><code>GET /api/payments</code> - List all payments</li>
                  <li><code>GET /api/payments/:id</code> - Get payment details</li>
                  <li><code>POST /api/payments</code> - Create new payment</li>
                  <li><code>PUT /api/payments/:id</code> - Update payment status</li>
                  <li><code>DELETE /api/payments/:id</code> - Delete payment</li>
                </ul>
                <p className="text-sm text-blue-700 mt-2">
                  Consider integrating with payment processors like Stripe, PayPal, or Square for real payment processing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
