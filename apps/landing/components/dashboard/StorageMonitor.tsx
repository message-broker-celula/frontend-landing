"use client";

import type { DatabaseInstance, DatabaseUsage } from "@/lib/api/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import {
  formatBytes,
  formatDate,
  storageTone,
  storageUsagePercent,
} from "@/lib/format";
import { Alert } from "@/components/ui/Alert";

// Actualizamos las props para recibir la instancia y el uso por separado
export function StorageMonitor({
  database,
  usage,
}: {
  database: DatabaseInstance;
  usage: DatabaseUsage | null;
}) {
  // Convertimos MB a Bytes para que funcione con tu función formatBytes existente
  const usedBytes = (usage?.storage_used_mb ?? 0) * 1024 * 1024;
  const maxBytes = (usage?.storage_limit_mb ?? 20) * 1024 * 1024;

  const percent = storageUsagePercent(usedBytes, maxBytes);
  const tone = storageTone(percent);

  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Monitoreo de almacenamiento
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Uso actual frente al límite de tu base de datos.
          </p>
        </div>
        <StatusBadge status={database.status} />
      </div>

      <div className="mt-6">
        <ProgressBar value={percent} label="Uso de almacenamiento" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-secondary">
          <span>
            Usado:{" "}
            <strong className="text-foreground">
              {formatBytes(usedBytes)}
            </strong>
          </span>
          <span>
            Máximo:{" "}
            <strong className="text-foreground">
              {formatBytes(maxBytes)}
            </strong>
          </span>
        </div>
      </div>

      {tone === "warning" ? (
        <div className="mt-4">
          <Alert tone="warning" title="Uso elevado">
            Has superado el 75% del almacenamiento disponible.
          </Alert>
        </div>
      ) : null}

      {tone === "critical" ? (
        <div className="mt-4">
          <Alert tone="error" title="Uso crítico">
            Has superado el 90% del almacenamiento. Libera espacio o contacta al
            administrador de la célula.
          </Alert>
        </div>
      ) : null}

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-background/60 px-3 py-3">
          <dt className="text-xs text-muted">Creación</dt>
          <dd className="mt-1 text-sm font-medium">
            {formatDate(database.created_at)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-background/60 px-3 py-3">
          <dt className="text-xs text-muted">Expira (TTL)</dt>
          <dd className="mt-1 text-sm font-medium">
            {formatDate(database.ttl_expires_at)}
          </dd>
        </div>
        <div className="rounded-xl border border-line bg-background/60 px-3 py-3">
          <dt className="text-xs text-muted">Estado actual</dt>
          <dd className="mt-1 text-sm font-medium capitalize">
            {database.status}
          </dd>
        </div>
      </dl>
    </section>
  );
}