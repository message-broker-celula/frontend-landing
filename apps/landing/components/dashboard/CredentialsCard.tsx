"use client";

import { Eye, EyeOff, Pause, Play } from "lucide-react";
import { useState } from "react";
import type { DatabaseInstance, DatabaseCredentials } from "@/lib/api/types";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/Button";
import { pauseDatabase, resumeDatabase } from "@/lib/api/endpoints";
import { useAuth } from "@/lib/auth/context";

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

export function CredentialsCard({
  database,
  credentials,
}: {
  database: DatabaseInstance;
  credentials: DatabaseCredentials | null;
}) {
  const { token, refreshSession } = useAuth();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggleState = async () => {
    if (!token) return;
    setIsToggling(true);
    try {
      if (database.status === "active") {
        await pauseDatabase(token, database.database_id);
      } else if (database.status === "paused") {
        await resumeDatabase(token, database.database_id);
      }
      // Refrescamos la sesión para que el estado de la BD se actualice en todo el Dashboard
      await refreshSession();
    } catch (err) {
      console.error("Error al cambiar el estado de la BD:", err);
    } finally {
      setIsToggling(false);
    }
  };

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
          <p className="mt-1 font-medium">{database.engine || "N/A"}</p>
        </div>
        <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
          <p className="text-xs text-muted">Creación</p>
          <p className="mt-1 font-medium">{formatDate(database.created_at)}</p>
        </div>
        <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
          <p className="text-xs text-muted">Estado</p>
          <p className="mt-1 font-medium capitalize">{database.status}</p>
        </div>
      </div>

      <div className="mt-2">
        <CredentialRow label="Host" value={credentials?.host || "N/A"} />
        <CredentialRow label="Puerto" value={String(credentials?.port || "N/A")} />
        <CredentialRow label="Base de datos" value={credentials?.database_name || "N/A"} />
        <CredentialRow label="Usuario" value={credentials?.username || "N/A"} />
        <CredentialRow label="Contraseña" value={credentials?.password || "N/A"} secret />
      </div>

      {/* 📌 BOTONES DE PAUSAR / REANUDAR */}
      {(database.status === "active" || database.status === "paused") && (
        <div className="mt-6 flex justify-end">
          <Button 
            variant="secondary" 
            onClick={handleToggleState} 
            disabled={isToggling}
          >
            {isToggling ? (
              "Procesando..."
            ) : database.status === "active" ? (
              <>
                <Pause size={16} className="mr-2" /> Pausar Base de Datos
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" /> Reanudar Base de Datos
              </>
            )}
          </Button>
        </div>
      )}
    </section>
  );
}