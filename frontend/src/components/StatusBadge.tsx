import type { ServiceStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<ServiceStatus, string> = {
  pending: "border-amber-200 bg-amber-100 text-amber-800",
  in_progress: "border-blue-200 bg-blue-100 text-blue-800",
  completed: "border-green-200 bg-green-100 text-green-800",
};

export function StatusBadge({ status, testid }: { status: ServiceStatus; testid?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLES[status],
      )}
      data-testid={testid}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
