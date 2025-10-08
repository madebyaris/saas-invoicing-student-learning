import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ClientsTable } from '@/components/clients/ClientsTable';
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '@/lib/hooks/useClients';
import { ClientDialog } from '@/components/clients/ClientDialog';
import { toast } from 'sonner';
import { ClientFormData } from '@/lib/validations';
import { Client } from '@/types/client';

const ClientsPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);

  const { data: clients = [], isLoading, error, refetch } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleAddClient = () => {
    setSelectedClient(null);
    setDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: ClientFormData) => {
    try {
      if (selectedClient) {
        await updateClient.mutateAsync({ id: selectedClient.id, ...values });
        toast.success('Client updated successfully');
      } else {
        await createClient.mutateAsync(values);
        toast.success('Client created successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save client');
      throw err;
    }
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      await deleteClient.mutateAsync(client.id);
      toast.success('Client deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete client');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage client records and keep contact information up to date.
          </p>
        </div>
        <Button onClick={handleAddClient}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      {error ? (
        <div className="flex h-64 flex-col items-center justify-center space-y-3">
          <p className="text-sm text-destructive">Failed to load clients.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <ClientsTable
          data={clients}
          isLoading={isLoading}
          onView={(client) => {
            toast(`Client: ${client.name}`, {
              description: client.email,
            });
          }}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      )}

      <ClientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        title={selectedClient ? 'Edit Client' : 'Add Client'}
        description={
          selectedClient
            ? 'Update the selected client details.'
            : 'Create a new client record.'
        }
        defaultValues={selectedClient ?? undefined}
      />
    </div>
  );
};

export default ClientsPage;
