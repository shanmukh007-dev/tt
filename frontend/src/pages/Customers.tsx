import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import type { Customer } from "@/lib/types";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CustomerModal } from "@/components/CustomerModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Customers() {
  const qc = useQueryClient();
  const customersQ = useQuery({ queryKey: ["customers"], queryFn: () => apiGet<Customer[]>("/customers"), retry: false });

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/customers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Customer deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Could not delete the customer"),
  });

  const filtered = (customersQ.data ?? []).filter((c) => {
    const q = search.trim().toLowerCase();
    return q === "" || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">The people behind the vehicles.</p>
        </div>
        <Button onClick={() => setCreating(true)} data-testid="add-customer-button">
          <Plus className="size-4" /> Add customer
        </Button>
      </div>

      {customersQ.isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="customers-error-banner">
          Could not load customers — the backend may be offline.
          <button onClick={() => customersQ.refetch()} className="font-medium underline underline-offset-2" data-testid="customers-retry-button">Retry</button>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="customer-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, email or phone…"
            className="w-72 pl-8"
            data-testid="customer-search-input"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {customersQ.isPending ? (
          <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="customers-loading">Loading…</p>
        ) : (
          <Table data-testid="customers-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} data-testid={`customer-row-${c.id}`}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" data-testid={`customer-vehicle-count-${c.id}`}>
                      {c.vehicle_count} {c.vehicle_count === 1 ? "vehicle" : "vehicles"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(c)} data-testid={`customer-edit-button-${c.id}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(c)} data-testid={`customer-delete-button-${c.id}`}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground" data-testid="customers-empty">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {creating && <CustomerModal onOpenChange={(o) => !o && setCreating(false)} />}
      {editing && <CustomerModal initial={editing} onOpenChange={(o) => !o && setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete customer"
        description={`Delete ${deleting?.name ?? ""}? Their vehicles and service records are removed too.`}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        busy={del.isPending}
      />
    </div>
  );
}
