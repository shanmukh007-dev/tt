import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { formatMoney } from "@/lib/types";
import type { Customer, ServiceRecord, Vehicle } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { VehicleModal } from "@/components/VehicleModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Vehicles() {
  const qc = useQueryClient();
  const vehiclesQ = useQuery({ queryKey: ["vehicles"], queryFn: () => apiGet<Vehicle[]>("/vehicles"), retry: false });
  const customersQ = useQuery({ queryKey: ["customers"], queryFn: () => apiGet<Customer[]>("/customers"), retry: false });

  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState<Vehicle | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/vehicles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Vehicle deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Could not delete the vehicle"),
  });

  const filtered = (vehiclesQ.data ?? []).filter((v) => {
    const q = search.trim().toLowerCase();
    return q === "" || `${v.year} ${v.make} ${v.model} ${v.plate} ${v.vin} ${v.owner_name}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="mt-1 text-sm text-muted-foreground">The registry — every vehicle and its owner.</p>
        </div>
        <Button onClick={() => setCreating(true)} data-testid="add-vehicle-button">
          <Plus className="size-4" /> Register vehicle
        </Button>
      </div>

      {vehiclesQ.isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="vehicles-error-banner">
          Could not load vehicles — the backend may be offline.
          <button onClick={() => vehiclesQ.refetch()} className="font-medium underline underline-offset-2" data-testid="vehicles-retry-button">Retry</button>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="vehicle-search">Search</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="vehicle-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Plate, VIN, make or owner…"
            className="w-72 pl-8"
            data-testid="vehicle-search-input"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {vehiclesQ.isPending ? (
          <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="vehicles-loading">Loading…</p>
        ) : (
          <Table data-testid="vehicles-table">
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id} data-testid={`vehicle-row-${v.id}`}>
                  <TableCell className="font-medium">{v.year} {v.make} {v.model}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono tracking-wide">{v.plate}</Badge></TableCell>
                  <TableCell>{v.owner_name}</TableCell>
                  <TableCell>{v.mileage.toLocaleString("en-US")} mi</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(v)} data-testid={`vehicle-edit-button-${v.id}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(v)} data-testid={`vehicle-delete-button-${v.id}`}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground" data-testid="vehicles-empty">
                    No vehicles match.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {creating && <VehicleModal customers={customersQ.data ?? []} onOpenChange={(o) => !o && setCreating(false)} />}
      {editing && <VehicleModal initial={editing} customers={customersQ.data ?? []} onOpenChange={(o) => !o && setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete vehicle"
        description={`Delete the ${deleting ? `${deleting.year} ${deleting.make} ${deleting.model}` : ""}? Its service records are removed too.`}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        busy={del.isPending}
      />
    </div>
  );
}
