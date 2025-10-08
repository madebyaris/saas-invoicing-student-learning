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
import { Client } from '@/types/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface ClientsTableProps {
  data: Client[];
  isLoading?: boolean;
  onView?: (client: Client) => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [search, setSearch] = React.useState('');

  const filteredData = React.useMemo(() => {
    if (!search) return data;
    const query = search.toLowerCase();
    return data.filter((client) =>
      [client.name, client.email, client.company_name]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    );
  }, [data, search]);

  const columns = React.useMemo<ColumnDef<Client>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Client',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        ),
      },
      {
        accessorKey: 'company_name',
        header: 'Company',
        cell: ({ row }) => row.getValue('company_name') || '—',
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => row.getValue('phone') || '—',
      },
      {
        accessorKey: 'country',
        header: 'Country',
        cell: ({ row }) => row.getValue('country') || '—',
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => new Date(row.getValue<string>('created_at')).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center gap-2">
              {onView && (
                <Button variant="ghost" size="sm" onClick={() => onView(client)}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(client)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(client)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onDelete, onEdit, onView]
  );

  const table = useReactTable({
    data: filteredData,
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Loading clients…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search clients"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <Badge variant="outline">{filteredData.length} clients</Badge>
      </div>

      <div className="rounded-md border">
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-sm">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

