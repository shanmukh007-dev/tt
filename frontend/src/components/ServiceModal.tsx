import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, apiPost, apiPut } from "@/lib/api";
import {
  apiErrorMessage,
  STATUS_LABELS,
  STATUS_ORDER,
  vehicleLabel,
  type ServiceRecord,
  type ServiceStatus,
  type Vehicle,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ServiceModalProps {
  initial?: ServiceRecord | null;
  vehicles: Vehicle[];
  onOpenChange: (open: boolean) => void;
}

// Mounted only while open — fresh form state on every open.
export function ServiceModal({ initial, vehicles, onOpenChange }: ServiceModalProps) {
  const [vehicleId, setVehicleId] = useState(initial?.vehicle_id ?? vehicles[0]?.id ?? "");
  const [serviceType, setServiceType] = useState(initial?.service_type ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [technician, setTechnician] = useState(initial?.technician ?? "");
  const [cost, setCost] = useState(initial ? String(initial.cost) : "");
  const [status, setStatus] = useState<ServiceStatus>(initial?.status ?? "pending");
  const [serviceDate, setServiceDate] = useState(initial?.service_date ?? "");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: () => {
      const body = {
        vehicle_id: vehicleId,
        service_type: serviceType.trim(),
        description: description.trim(),
        technician: technician.trim(),
        cost: Number(cost || 0),
        status,
        service_date: serviceDate || undefined, // empty → backend anchors "today"
      };
      return initial
        ? apiPut<ServiceRecord>(`/services/${initial.id}`, body)
        : apiPost<ServiceRecord>("/services", body);
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success(initial ? "Service record updated" : "Service record created");
      onOpenChange(false);
    },
    onError: (err) =>
      setError(
        apiErrorMessage(
          err,
          err instanceof ApiError && err.status === 422
            ? "Please check the fields — cost must be a number."
            : "Could not save the service record.",
        ),
      ),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!vehicleId) {
      setError("Select a vehicle — register one first if none exist.");
      return;
    }
    if (!Number.isFinite(Number(cost)) || Number(cost) < 0) {
      setError("Enter a valid cost (0 or more).");
      return;
    }
    save.mutate();
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="service-modal">
        <DialogHeader>
          <DialogTitle data-testid="service-modal-title">{initial ? "Edit service record" : "New service record"}</DialogTitle>
          <DialogDescription>Track the job, its technician, cost and status.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit} data-testid="service-form">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            {vehicles.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" data-testid="service-no-vehicles-hint">
                No vehicles yet — register a vehicle first.
              </p>
            ) : (
              <Select value={vehicleId} onValueChange={(v: string) => setVehicleId(v)}>
                <SelectTrigger data-testid="service-vehicle-select">
                  <SelectValue>{(v: string) => vehicles.find((x) => x.id === v) ? vehicleLabel(vehicles.find((x) => x.id === v)!) : "Select vehicle"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{vehicleLabel(v)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-type">Service</Label>
            <Input id="service-type" required value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="Synthetic Oil & Filter Change" data-testid="service-type-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service-description">Work performed (optional)</Label>
            <Textarea id="service-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Full synthetic 0W-20, filter replaced, 21-point inspection." data-testid="service-description-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-technician">Technician</Label>
              <Input id="service-technician" value={technician} onChange={(e) => setTechnician(e.target.value)} placeholder="Arjun Nair" data-testid="service-technician-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-cost">Cost (USD)</Label>
              <Input id="service-cost" type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="89.99" data-testid="service-cost-input" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: string) => setStatus(v as ServiceStatus)}>
                <SelectTrigger data-testid="service-status-select">
                  <SelectValue>{(v: string) => STATUS_LABELS[v as ServiceStatus] ?? "Select status"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-date">Service date</Label>
              <Input id="service-date" type="date" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} data-testid="service-date-input" />
            </div>
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" data-testid="service-form-error">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="service-cancel-button">Cancel</Button>
            <Button type="submit" disabled={save.isPending || vehicles.length === 0} data-testid="service-save-button">
              {save.isPending ? "Saving…" : initial ? "Save changes" : "Create record"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
