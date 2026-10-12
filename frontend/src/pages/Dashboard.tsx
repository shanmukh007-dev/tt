import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Car, CheckCircle2, ClipboardList, DollarSign, Plus, Wrench } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/types";
import type { Customer, ServiceRecord, Vehicle } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function KpiCard({ label, value, icon: Icon, testid }: { label: string; value: string; icon: LucideIcon; testid: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5" data-testid={testid}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const servicesQ = useQuery({ queryKey: ["services"], queryFn: () => apiGet<ServiceRecord[]>("/services"), retry: false });
  const vehiclesQ = useQuery({ queryKey: ["vehicles"], queryFn: () => apiGet<Vehicle[]>("/vehicles"), retry: false });
  const customersQ = useQuery({ queryKey: ["customers"], queryFn: () => apiGet<Customer[]>("/customers"), retry: false });

  const services = servicesQ.data ?? [];
  const active = services.filter((s) => s.status !== "completed");
  const completed = services.filter((s) => s.status === "completed");
  const totalValue = services.reduce((sum, s) => sum + (s.cost ?? 0), 0);

  const retryAll = () => {
    servicesQ.refetch();
    vehiclesQ.refetch();
    customersQ.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Today at the workshop, at a glance.</p>
        </div>
        <Link to="/services" className={buttonVariants({})} data-testid="dashboard-new-service-link">
          <Plus className="size-4" /> New service record
        </Link>
      </div>

      {(servicesQ.isError || vehiclesQ.isError || customersQ.isError) && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" data-testid="dashboard-error-banner">
          Could not load dashboard data — the backend may be offline.
          <button onClick={retryAll} className="font-medium underline underline-offset-2" data-testid="dashboard-retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active workorders" value={String(active.length)} icon={Wrench} testid="kpi-active-workorders" />
        <KpiCard label="Completed services" value={String(completed.length)} icon={CheckCircle2} testid="kpi-completed-services" />
        <KpiCard label="Vehicles in system" value={String(vehiclesQ.data?.length ?? 0)} icon={Car} testid="kpi-vehicles" />
        <KpiCard label="Total service value" value={formatMoney(totalValue)} icon={DollarSign} testid="kpi-total-value" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl border border-border bg-card lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <ClipboardList className="size-4 text-primary" />
            <h2 className="font-heading text-base font-semibold tracking-tight">Active workorders</h2>
          </div>
          {servicesQ.isPending ? (
            <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="dashboard-loading">Loading…</p>
          ) : active.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="dashboard-active-empty">
              No active workorders — all caught up.
            </p>
          ) : (
            <Table data-testid="dashboard-active-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.slice(0, 8).map((s) => (
                  <TableRow key={s.id} data-testid={`dashboard-workorder-row-${s.id}`}>
                    <TableCell className="font-medium">{s.vehicle_label}</TableCell>
                    <TableCell>{s.service_type}</TableCell>
                    <TableCell>{s.technician || "—"}</TableCell>
                    <TableCell>{formatDate(s.service_date)}</TableCell>
                    <TableCell><StatusBadge status={s.status} testid={`dashboard-workorder-status-${s.id}`} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <CheckCircle2 className="size-4 text-green-600" />
            <h2 className="font-heading text-base font-semibold tracking-tight">Recently completed</h2>
          </div>
          {servicesQ.isPending ? (
            <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="dashboard-recent-loading">Loading…</p>
          ) : completed.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground" data-testid="dashboard-recent-empty">Nothing completed yet.</p>
          ) : (
            <ul className="divide-y divide-border" data-testid="dashboard-recent-list">
              {completed.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-slate-50/80">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.service_type}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.vehicle_label} · {formatDate(s.service_date)}</p>
                  </div>
                  <span className="font-mono text-sm tracking-wide">{formatMoney(s.cost)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
