import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { invoiceSchema, InvoiceFormData, invoiceItemSchema } from '@/lib/validations';
import apiClient from '@/lib/api';
import { toast } from 'sonner';

interface NewInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InvoiceFormData) => Promise<void> | void;
}

export const NewInvoiceDialog: React.FC<NewInvoiceDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      client_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      tax_rate: 0,
      invoice_items: [
        {
          description: '',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invoice_items',
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await apiClient.get('/api/clients');
      return response.data?.data ?? [];
    },
  });

  const recalcItemTotal = (index: number) => {
    const quantity = form.getValues(`invoice_items.${index}.quantity`);
    const unitPrice = form.getValues(`invoice_items.${index}.unit_price`);
    const total = Number(quantity) * Number(unitPrice);
    form.setValue(`invoice_items.${index}.total_price`, Number.isFinite(total) ? total : 0);
  };

  const subtotal = form
    .watch('invoice_items')
    .reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
  const taxRate = Number(form.watch('tax_rate') || 0);
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  const handleAddItem = () => {
    append({ description: '', quantity: 1, unit_price: 0, total_price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    if (fields.length === 1) return;
    remove(index);
  };

  const handleSubmit = async (values: InvoiceFormData) => {
    try {
      await invoiceSchema.parseAsync({
        ...values,
        invoice_items: values.invoice_items.map((item) =>
          invoiceItemSchema.parse({
            ...item,
            total_price: item.quantity * item.unit_price,
          })
        ),
      });

      await onSubmit({
        ...values,
        invoice_items: values.invoice_items.map((item) => ({
          ...item,
          total_price: item.quantity * item.unit_price,
        })),
      });

      form.reset();
      onOpenChange(false);
    } catch (err) {
      toast.error('Failed to create invoice');
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogDescription>Create a new invoice for your client.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="USD" maxLength={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issue_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (0-1)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Internal notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Payment terms" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Line Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-4 md:grid-cols-12">
                    <FormField
                      control={form.control}
                      name={`invoice_items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-5">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Item description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoice_items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={field.value}
                              onChange={(event) => {
                                const value = Number(event.target.value) || 0;
                                field.onChange(value);
                                recalcItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoice_items.${index}.unit_price`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={field.value}
                              onChange={(event) => {
                                const value = Number(event.target.value) || 0;
                                field.onChange(value);
                                recalcItemTotal(index);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`invoice_items.${index}.total_price`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Total</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly className="bg-muted" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 pt-6">
                <div className="flex justify-end">
                  <div className="w-56 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Create invoice</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

