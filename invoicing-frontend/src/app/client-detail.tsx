import { useParams, Link } from '@tanstack/react-router';
import { useClients, useDeleteClient } from '@/lib/hooks/useClients';
import { useInvoices } from '@/lib/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MapPin, Building, FileText, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientDetailPage() {
  const { clientId } = useParams({ from: '/dashboard/clients/$clientId' });
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const deleteClientMutation = useDeleteClient();

  const client = clients.find(c => c.id === clientId);
  const clientInvoices = invoices.filter(invoice => invoice.client_id === clientId);

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit client:', client?.id);
  };

  const handleDelete = async () => {
    if (!client) return;
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      try {
        await deleteClientMutation.mutateAsync(client.id);
        // Redirect to clients list after successful deletion
        window.location.href = '/dashboard/clients';
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Not Found</h3>
          <p className="text-gray-600 mb-4">The client you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/dashboard/clients">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue = clientInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  const pendingAmount = clientInvoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'draft')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  const overdueAmount = clientInvoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard/clients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            {client.company_name && (
              <p className="text-gray-600">{client.company_name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
          <Button variant="outline" onClick={handleDelete} disabled={deleteClientMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-800">
                      {client.email}
                    </a>
                  </div>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <a href={`tel:${client.phone}`} className="text-blue-600 hover:text-blue-800">
                      {client.phone}
                    </a>
                  </div>
                </div>
              )}
              {(client.address_line1 || client.city || client.state) && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <div className="text-gray-900">
                      {client.address_line1 && <p>{client.address_line1}</p>}
                      {client.address_line2 && <p>{client.address_line2}</p>}
                      {(client.city || client.state || client.postal_code) && (
                        <p>
                          {client.city && client.city}
                          {client.city && client.state && ', '}
                          {client.state && client.state}
                          {client.postal_code && ` ${client.postal_code}`}
                        </p>
                      )}
                      {client.country && <p>{client.country}</p>}
                    </div>
                  </div>
                </div>
              )}
              {client.tax_id && (
                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tax ID</p>
                    <p className="text-gray-900">{client.tax_id}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                {clientInvoices.length} total invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading invoices...</p>
                </div>
              ) : clientInvoices.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No invoices found for this client.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientInvoices.slice(0, 5).map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to="/dashboard/invoices/$invoiceId" 
                            params={{ invoiceId: invoice.id }}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            {invoice.invoice_number}
                          </Link>
                          <Badge variant="outline" className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${invoice.total_amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{invoice.currency}</p>
                      </div>
                    </div>
                  ))}
                  {clientInvoices.length > 5 && (
                    <div className="text-center pt-2">
                      <Link to="/dashboard/invoices" className="text-sm text-blue-600 hover:text-blue-800">
                        View all {clientInvoices.length} invoices
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                </div>
                <span className="font-semibold text-green-600">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Pending</span>
                </div>
                <span className="font-semibold text-yellow-600">${pendingAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Overdue</span>
                </div>
                <span className="font-semibold text-red-600">${overdueAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Invoices</span>
                <span className="font-semibold">{clientInvoices.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Paid Invoices</span>
                <span className="font-semibold">
                  {clientInvoices.filter(inv => inv.status === 'paid').length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Client Details */}
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Client ID</label>
                <p className="text-gray-900 font-mono text-sm">{client.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900">{format(new Date(client.created_at), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-900">{format(new Date(client.updated_at), 'MMM dd, yyyy')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
