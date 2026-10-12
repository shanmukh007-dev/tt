import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError, apiPost, apiPut } from "@/lib/api";
import { apiErrorMessage, type Customer, type Vehicle } from "@/lib/types";
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

interface VehicleModalProps {
  initial?: Vehicle | null;
  customers: Customer[];
  onOpenChange: (open: boolean) => void;
}

// Mounted only while open — fresh form state on every open.
export function VehicleModal({ initial, customers, onOpenChange }: VehicleModalProps) {
  const [customerId, setCustomerId] = useState(initial?.customer_id ?? customers[0]?.id ?? "");
  const [make, setMake] = useState(initial?.make ?? "");
  const [model, setModel] = useState(initial?.model ?? "");
  const [year, setYear] = useState(initial ? String(initial.year) : "");
  const [plate, setPlate] = useState(initial?.plate ?? "");
  const [vin, setVin] = useState(initial?.vin ?? "");
  const [mileage, setMileage] = useState(initial ? String(initial.mileage) : "");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: () => {
      const body = {
        customer_id: customerId,
        make: make.trim(),
        model: model.trim(),
        year: Number(year),
        plate: plate.trim().toUpperCase(),
        vin: vin.trim(),
        mileage: Number(mileage || 0),
      };
      return initial ? apiPut<Vehicle>(`/vehicles/${initial.id}`, body) : apiPost<Vehicle>("/vehicles", body);
    },
    onSuccess: (vehicle) => {
      qc.invalidateQueries();
      toast.success(initial ? "Vehicle updated" : `${vehicle.year} ${vehicle.make} ${vehicle.model} registered`);
      onOpenChange(false);
    },
    onError: (err) =>
      setError(
        apiErrorMessage(
          err,
          err instanceof ApiError && err.status === 422
            ? "Please check the fields — year and mileage must be numbers."
            : "Could not save the vehicle.",
        ),
      ),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerId) {
      setError("Select an owner — add a customer first if none exist.");
      return;
    }
    if (!Number.isInteger(Number(year)) || Number(year) < 1950 || Number(year) > 2100) {
      setError("Enter a valid model year (1950–2100).");
      return;
    }
    save.mutate();
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="vehicle-modal">
        <DialogHeader>
          <DialogTitle data-testid="vehicle-modal-title">{initial ? "Edit vehicle" : "Register vehicle"}</DialogTitle>
          <DialogDescription>Link the vehicle to its owner in the customer registry.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit} data-testid="vehicle-form">
          <div className="space-y-2">
            <Label>Owner</Label>
            {customers.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" data-testid="vehicle-no-customers-hint">
                No customers yet — add a customer first.
              </p>
            ) : (
              <Select value={customerId} onValueChange={(v: string) => setCustomerId(v)}>
                <SelectTrigger data-testid="vehicle-owner-select">
                  <SelectValue>{(v: string) => customers.find((c) => c.id === v)?.name ?? "Select owner"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle-make">Make</Label>
              <Input id="vehicle-make" required value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota" data-testid="vehicle-make-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-model">Model</Label>
              <Input id="vehicle-model" required value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" data-testid="vehicle-model-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-year">Year</Label>
              <Input id="vehicle-year" required type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2022" data-testid="vehicle-year-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-plate">Plate</Label>
              <Input id="vehicle-plate" required value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="7KJD421" data-testid="vehicle-plate-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-vin">VIN (optional)</Label>
              <Input id="vehicle-vin" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="4T1C11AK5NU568134" data-testid="vehicle-vin-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle-mileage">Mileage</Label>
              <Input id="vehicle-mileage" type="number" min={0} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="42350" data-testid="vehicle-mileage-input" />
            </div>
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" data-testid="vehicle-form-error">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="vehicle-cancel-button">Cancel</Button>
            <Button type="submit" disabled={save.isPending || customers.length === 0} data-testid="vehicle-save-button">
              {save.isPending ? "Saving…" : initial ? "Save changes" : "Register vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
