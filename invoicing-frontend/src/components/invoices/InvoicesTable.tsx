import React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Invoice } from '@/types/invoice';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2, Send, Download } from 'lucide-react';

const statusClassMap: Record<Invoice['status'], string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-muted text-muted-foreground',
};

interface InvoicesTableProps {
  data: Invoice[];
  isLoading?: boolean;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onSend?: (invoice: Invoice) => void;
  onDownload?: (invoice: Invoice) => void;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onSend,
  onDownload,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const columns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: 'invoice_number',
        header: 'Invoice #',
        cell: ({ row }) => <span className="font-medium">{row.getValue('invoice_number')}</span>,
      },
      {
        accessorKey: 'client.name',
        header: 'Client',
        cell: ({ row }) => row.original.client?.name ?? 'N/A',
      },
      {
        accessorKey: 'issue_date',
        header: 'Issue Date',
        cell: ({ row }) => new Date(row.getValue<string>('issue_date')).toLocaleDateString(),
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',
        cell: ({ row }) => new Date(row.getValue<string>('due_date')).toLocaleDateString(),
      },
      {
        accessorKey: 'total_amount',
        header: 'Total',
        cell: ({ row }) => `$${Number(row.getValue('total_amount')).toLocaleString()}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.getValue<Invoice['status']>('status');
          return (
            <Badge className={statusClassMap[status]}>{status.toUpperCase()}</Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const invoice = row.original;
          return (
            <div className="flex items-center gap-2">
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(invoice)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && invoice.status === 'draft' && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(invoice)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onSend && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Button variant="ghost" size="sm" onClick={() => onSend(invoice)}>
                  <Send className="h-4 w-4" />
                </Button>
              )}
              {onDownload && (
                <Button variant="ghost" size="sm" onClick={() => onDownload(invoice)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(invoice)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onDelete, onDownload, onEdit, onSend, onView]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  React.useEffect(() => {
    table.getColumn('status')?.setFilterValue(statusFilter === 'all' ? undefined : statusFilter);
  }, [statusFilter, table]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading invoices…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search invoices"
          value={(table.getColumn('invoice_number')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('invoice_number')?.setFilterValue(event.target.value)
          }
          className="w-full md:max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No invoices found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
          invoice(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

