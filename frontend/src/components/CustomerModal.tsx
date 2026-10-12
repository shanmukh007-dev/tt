import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage, type Customer } from "@/lib/types";
import { ApiError, apiPost, apiPut } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";

interface CustomerModalProps {
  initial?: Customer | null;
  onOpenChange: (open: boolean) => void;
}

// Mounted only while open — fresh form state on every open.
export function CustomerModal({ initial, onOpenChange }: CustomerModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const save = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), email: email.trim(), phone: phone.trim(), address: address.trim() };
      return initial
        ? apiPut<Customer>(`/customers/${initial.id}`, body)
        : apiPost<Customer>("/customers", body);
    },
    onSuccess: (customer) => {
      qc.invalidateQueries();
      toast.success(initial ? "Customer updated" : `${customer.name} added`);
      onOpenChange(false);
    },
    onError: (err) => setError(apiErrorMessage(err, err instanceof ApiError && err.status === 422 ? "Please check the fields — email must be valid." : "Could not save the customer.")),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    save.mutate();
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="customer-modal">
        <DialogHeader>
          <DialogTitle data-testid="customer-modal-title">{initial ? "Edit customer" : "Add customer"}</DialogTitle>
          <DialogDescription>Contact details for the service center's records.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit} data-testid="customer-form">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Full name</Label>
            <Input id="customer-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" data-testid="customer-name-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input id="customer-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya.sharma@example.com" data-testid="customer-email-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone</Label>
            <Input id="customer-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" data-testid="customer-phone-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-address">Address</Label>
            <Textarea id="customer-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 MG Road, Indiranagar, Bengaluru" data-testid="customer-address-input" />
          </div>
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" data-testid="customer-form-error">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="customer-cancel-button">Cancel</Button>
            <Button type="submit" disabled={save.isPending} data-testid="customer-save-button">
              {save.isPending ? "Saving…" : initial ? "Save changes" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
