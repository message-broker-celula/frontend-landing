import type { DatabaseStatus } from "@/lib/api/types";

const statusStyles: Record<DatabaseStatus, string> = {
  active: "bg-good/10 text-good border-good/20",
  provisioning: "bg-accent-soft text-accent border-accent/20",
  paused: "bg-series-3/10 text-series-3 border-series-3/20",
  deleted: "bg-muted/20 text-muted border-line",
  error: "bg-series-6/10 text-series-6 border-series-6/20",
};

const statusLabels: Record<DatabaseStatus, string> = {
  active: "Activa",
  provisioning: "Aprovisionando",
  paused: "Pausada",
  deleted: "Eliminada",
  error: "Error",
};

export function StatusBadge({ status }: { status: DatabaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
