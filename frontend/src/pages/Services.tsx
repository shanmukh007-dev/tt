import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/types";
import type { Customer, ServiceRecord, ServiceStatus, Vehicle } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ServiceModal } from "@/components/ServiceModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Services() {
  const qc = useQueryClient();
  const servicesQ = useQuery({ queryKey: ["services"], queryFn: () => apiGet<ServiceRecord[]>("/services"), retry: false });
  const vehiclesQ = useQuery({ queryKey: ["vehicles"], queryFn: () => apiGet<Vehicle[]>("/vehicles"), retry: false });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "all">("all");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [deleting, setDeleting] = useState<ServiceRecord | null>(null);

  const del = useMutation({
    mutationFn: (id: string) => apiDelete<void>(`/services/${id}`),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Service record deleted");
      setDeleting(null);
    },
    onError: () => toast.error("Could not delete the service record"),
  });

  const filtered = (servicesQ.data ?? []).filter((s) => {
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = q === "" || `${s.vehicle_label} ${s.service_type} ${s.technician}`.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Service Records</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every job, its status and its cost — the workshop's ledger.</p>
        </div>
        <Button onClick={() => setCreating(true)} data-testid="add-service-button">
          <Plus className="size-4" /> New service record
        </Button>
      </div>

      {servicesQ.isError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="services-error-banner">
          Could not load service records — the backend may be offline.
          <button onClick={() => servicesQ.refetch()} className="font-medium underline underline-offset-2" data-testid="services-retry-button">Retry</button>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="service-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="service-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Vehicle, service or technician…"
              className="w-72 pl-8"
              data-testid="service-search-input"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as ServiceStatus | "all")}>
            <SelectTrigger className="w-44" data-testid="service-status-filter">
              <SelectValue>{(v: string) => (v === "all" ? "All statuses" : v)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {servicesQ.isPending ? (
          <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="services-loading">Loading…</p>
        ) : (
          <Table data-testid="services-table">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} data-testid={`service-row-${s.id}`}>
                  <TableCell>{formatDate(s.service_date)}</TableCell>
                  <TableCell className="font-medium">{s.vehicle_label}</TableCell>
                  <TableCell>{s.service_type}</TableCell>
                  <TableCell>{s.technician || "—"}</TableCell>
                  <TableCell><StatusBadge status={s.status} testid={`service-status-badge-${s.id}`} /></TableCell>
                  <TableCell className="text-right font-mono tracking-wide">{formatMoney(s.cost)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditing(s)} data-testid={`service-edit-button-${s.id}`}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(s)} data-testid={`service-delete-button-${s.id}`}>
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground" data-testid="services-empty">
                    No service records match.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {creating && <ServiceModal vehicles={vehiclesQ.data ?? []} onOpenChange={(o) => !o && setCreating(false)} />}
      {editing && <ServiceModal initial={editing} vehicles={vehiclesQ.data ?? []} onOpenChange={(o) => !o && setEditing(null)} />}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete service record"
        description={`Delete "${deleting?.service_type}" for ${deleting?.vehicle_label ?? ""}? This cannot be undone.`}
        onConfirm={() => deleting && del.mutate(deleting.id)}
        busy={del.isPending}
      />
    </div>
  );
}
