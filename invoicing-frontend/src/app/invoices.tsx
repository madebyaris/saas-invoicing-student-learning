import React from 'react';
import {
  useInvoices,
  useCreateInvoice,
  useDeleteInvoice,
  useUpdateInvoiceStatus,
} from '@/lib/hooks/useInvoices';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { NewInvoiceDialog } from '@/components/invoices/NewInvoiceDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceFormData } from '@/lib/validations';

const InvoicesPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data: invoices = [], isLoading, error, refetch } = useInvoices();
  const createInvoice = useCreateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const updateStatus = useUpdateInvoiceStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage invoices, track payment status, and send reminders.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {error ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-3">
          <p className="text-sm text-destructive">Failed to load invoices.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <InvoicesTable
          data={invoices}
          isLoading={isLoading}
          onDelete={async (invoice) => {
            try {
              await deleteInvoice.mutateAsync(invoice.id);
              toast.success('Invoice deleted');
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Failed to delete invoice');
            }
          }}
          onSend={async (invoice) => {
            try {
              await updateStatus.mutateAsync({ id: invoice.id, status: 'sent' });
              toast.success('Invoice marked as sent');
            } catch (err: any) {
              toast.error(err.response?.data?.error || 'Failed to update status');
            }
          }}
          onDownload={(invoice) => {
            toast('Download not implemented yet', {
              description: `Invoice #${invoice.invoice_number}`,
            });
          }}
        />
      )}

      <NewInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={async (payload: InvoiceFormData) => {
          try {
            await createInvoice.mutateAsync(payload);
            toast.success('Invoice created');
          } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to create invoice');
            throw err;
          }
        }}
      />
    </div>
  );
};

export default InvoicesPage;
