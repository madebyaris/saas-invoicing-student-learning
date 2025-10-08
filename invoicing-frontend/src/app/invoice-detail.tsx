import { useParams, Link } from '@tanstack/react-router';
import { useInvoice, useUpdateInvoiceStatus } from '@/lib/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Send, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Edit },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: Send },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams({ from: '/dashboard/invoices/$invoiceId' });
  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const updateStatusMutation = useUpdateInvoiceStatus();

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') => {
    if (!invoice) return;
    try {
      await updateStatusMutation.mutateAsync({ id: invoice.id, status: newStatus });
    } catch (error) {
      console.error('Failed to update invoice status:', error);
    }
  };

  const handleSend = () => {
    // TODO: Implement send functionality
    console.log('Send invoice:', invoice?.id);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download invoice:', invoice?.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    console.log('Delete invoice:', invoice?.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Not Found</h3>
          <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/dashboard/invoices">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig]?.icon || Clock;
  const statusColor = statusConfig[invoice.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h1>
            <p className="text-gray-600">Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusColor}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[invoice.status as keyof typeof statusConfig]?.label || invoice.status}
          </Badge>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        {invoice.status === 'draft' && (
          <Button onClick={() => handleStatusChange('sent')} disabled={updateStatusMutation.isPending}>
            <Send className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        )}
        {invoice.status === 'sent' && (
          <Button onClick={() => handleStatusChange('paid')} disabled={updateStatusMutation.isPending}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Paid
          </Button>
        )}
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handleSend}>
          <Send className="h-4 w-4 mr-2" />
          Send Email
        </Button>
        <Button variant="outline" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">{invoice.client?.name}</h3>
                {invoice.client?.company_name && (
                  <p className="text-gray-600">{invoice.client.company_name}</p>
                )}
                {invoice.client?.email && (
                  <p className="text-gray-600">{invoice.client.email}</p>
                )}
                {invoice.client?.phone && (
                  <p className="text-gray-600">{invoice.client.phone}</p>
                )}
                {invoice.client?.address_line1 && (
                  <div className="text-gray-600">
                    <p>{invoice.client.address_line1}</p>
                    {invoice.client.address_line2 && <p>{invoice.client.address_line2}</p>}
                    <p>
                      {invoice.client.city}, {invoice.client.state} {invoice.client.postal_code}
                    </p>
                    {invoice.client.country && <p>{invoice.client.country}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.invoice_items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-start py-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.description}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.quantity * item.unit_price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${(invoice.total_amount - (invoice.tax_amount || 0)).toFixed(2)}</span>
                  </div>
                  {invoice.tax_rate > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({(invoice.tax_rate * 100).toFixed(1)}%)</span>
                      <span>${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Info */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Invoice Number</label>
                <p className="text-gray-900">{invoice.invoice_number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Issue Date</label>
                <p className="text-gray-900">{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Due Date</label>
                <p className="text-gray-900">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Currency</label>
                <p className="text-gray-900">{invoice.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge className={statusColor}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[invoice.status as keyof typeof statusConfig]?.label || invoice.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          {invoice.terms && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{invoice.terms}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
