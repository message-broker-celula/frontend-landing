"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { UserDatabase } from "@/lib/api/types";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

function CredentialRow({
  label,
  value,
  mono = true,
  secret = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  secret?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const display = secret && !visible ? "••••••••••••" : value;

  return (
    <div className="flex flex-col gap-2 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
        <p
          className={`mt-1 break-all text-sm ${mono ? "font-mono" : "font-medium"}`}
        >
          {display}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {secret ? (
          <button
            type="button"
            onClick={() => {
              setVisible((current) => !current);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-secondary transition-colors hover:bg-background hover:text-foreground"
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        ) : null}
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export function CredentialsCard({ database }: { database: UserDatabase }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Credenciales de conexión
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Usa estos datos para conectar tu cliente SQL o aplicación.
          </p>
        </div>
        <StatusBadge status={database.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
          <p className="text-xs text-muted">Motor</p>
          <p className="mt-1 font-medium">{database.engine}</p>
        </div>
        <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
          <p className="text-xs text-muted">Creación</p>
          <p className="mt-1 font-medium">{formatDate(database.createdAt)}</p>
        </div>
        <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
          <p className="text-xs text-muted">Estado</p>
          <p className="mt-1 font-medium capitalize">{database.status}</p>
        </div>
      </div>

      <div className="mt-2">
        <CredentialRow label="Host" value={database.host} />
        <CredentialRow label="Puerto" value={String(database.port)} />
        <CredentialRow label="Base de datos" value={database.databaseName} />
        <CredentialRow label="Usuario" value={database.username} />
        <CredentialRow label="Contraseña" value={database.password} secret />
      </div>
    </section>
  );
}
