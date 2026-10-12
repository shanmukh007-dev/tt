import { useQuery } from "@tanstack/react-query";
import { Car, CircleCheck, GaugeCircle } from "lucide-react";
import { apiGet } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/types";
import type { PortalSummary } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CustomerPortal() {
  const { data: summary, isPending, isError, refetch } = useQuery({
    queryKey: ["portal"],
    queryFn: () => apiGet<PortalSummary>("/portal/summary"),
    retry: false,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground" data-testid="portal-loading">Loading your vehicles…</p>;
  }
  if (isError || !summary) {
    return (
      <div className="rounded-xl border border-border bg-card p-6" data-testid="portal-error">
        <p className="text-sm text-red-800">Could not load your service information — please try again shortly.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()} data-testid="portal-retry-button">Retry</Button>
      </div>
    );
  }
  if (summary.vehicles.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center" data-testid="portal-empty">
        <Car className="mx-auto size-8 text-muted-foreground" />
        <h1 className="mt-3 font-heading text-xl font-bold tracking-tight">No vehicles yet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Our team will register your vehicle after your first visit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight" data-testid="portal-welcome">
          Welcome back, {summary.customer.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your vehicles and their full service history.</p>
      </div>

      <Tabs defaultValue={summary.vehicles[0].id}>
        <TabsList className="h-auto flex-wrap" data-testid="portal-vehicle-tabs">
          {summary.vehicles.map((v) => (
            <TabsTrigger key={v.id} value={v.id} data-testid={`portal-vehicle-tab-${v.id}`}>
              {v.year} {v.make} {v.model}
            </TabsTrigger>
          ))}
        </TabsList>

        {summary.vehicles.map((v) => {
          const activeJob = v.services.find((s) => s.status !== "completed");
          return (
            <TabsContent key={v.id} value={v.id} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card size="sm" data-testid={`portal-vehicle-card-${v.id}`}>
                  <CardContent className="flex items-start gap-3">
                    <Car className="mt-0.5 size-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>
                      <p className="text-sm font-medium">{v.year} {v.make} {v.model}</p>
                      <p className="mt-0.5 font-mono text-xs tracking-wide text-muted-foreground">{v.plate}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardContent className="flex items-start gap-3">
                    <GaugeCircle className="mt-0.5 size-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Mileage</p>
                      <p className="text-sm font-medium">{v.mileage.toLocaleString("en-US")} mi</p>
                    </div>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Service visits</p>
                    <p className="text-sm font-medium" data-testid={`portal-service-count-${v.id}`}>{v.services.length}</p>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardContent>
                    <p className="text-xs text-muted-foreground">Current job</p>
                    <div className="mt-1">
                      {activeJob ? (
                        <StatusBadge status={activeJob.status} testid={`portal-active-status-${v.id}`} />
                      ) : (
                        <p className="flex items-center gap-1.5 text-sm font-medium text-green-700" data-testid={`portal-all-clear-${v.id}`}>
                          <CircleCheck className="size-4" /> All clear
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-heading text-base font-semibold tracking-tight">Service history</h2>
                </div>
                {v.services.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground" data-testid={`portal-history-empty-${v.id}`}>
                    No service history for this vehicle yet.
                  </p>
                ) : (
                  <Table data-testid={`portal-history-table-${v.id}`}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Work performed</TableHead>
                        <TableHead>Technician</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {v.services.map((s) => (
                        <TableRow key={s.id} data-testid={`portal-service-row-${s.id}`}>
                          <TableCell>{formatDate(s.service_date)}</TableCell>
                          <TableCell className="font-medium">{s.service_type}</TableCell>
                          <TableCell className="max-w-72 truncate text-muted-foreground">{s.description || "—"}</TableCell>
                          <TableCell>{s.technician || "—"}</TableCell>
                          <TableCell><StatusBadge status={s.status} testid={`portal-service-status-${s.id}`} /></TableCell>
                          <TableCell className="text-right font-mono tracking-wide">{formatMoney(s.cost)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
