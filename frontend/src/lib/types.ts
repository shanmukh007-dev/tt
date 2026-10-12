// Hand-written mirrors of the backend Pydantic models — nothing infers across the HTTP boundary,
// so keep every interface in sync with backend/models/*.py in the same edit.
import { ApiError } from "./api";

export type Role = "staff" | "customer";
export type ServiceStatus = "pending" | "in_progress" | "completed";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  customer_id: string | null;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  vehicle_count: number;
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  mileage: number;
  created_at: string;
  owner_name: string;
}

export interface ServiceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string;
  technician: string;
  cost: number;
  status: ServiceStatus;
  service_date: string;
  created_at: string;
  vehicle_label: string;
  owner_name: string;
}

export interface PortalVehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  vin: string;
  mileage: number;
  created_at: string;
  owner_name: string;
  vehicle_count: number;
  services: ServiceRecord[];
}

export interface PortalSummary {
  customer: Customer;
  vehicles: PortalVehicle[];
}

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

export const STATUS_ORDER: ServiceStatus[] = ["pending", "in_progress", "completed"];

export function vehicleLabel(v: { year: number; make: string; model: string; plate: string }): string {
  return `${v.year} ${v.make} ${v.model} · ${v.plate}`;
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const detail = (err.body as { detail?: unknown } | null)?.detail;
    if (typeof detail === "string") return detail;
  }
  return fallback;
}
