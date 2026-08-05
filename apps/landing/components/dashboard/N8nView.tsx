"use client";

import { useState } from "react";
import { Workflow, ExternalLink, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

type N8nStatus = "unprovisioned" | "provisioning" | "ready";

type N8nCredentials = {
  url: string;
  username: string;
  password: string;
};

export function N8nView() {
  const [status, setStatus] = useState<N8nStatus>("unprovisioned");
  const [credentials, setCredentials] = useState<N8nCredentials | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleProvision = () => {
    setStatus("provisioning");

    // Simulamos el tiempo que tarda el backend en levantar el contenedor de N8N
    setTimeout(() => {
      setCredentials({
        url: "https://n8n.mbro.coderhivex.com",
        username: "admin_mbro",
        password: "N8n_S3cure_P4ss_2026!"
      });
      setStatus("ready");
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Estado 1: No tiene N8N, botón para crearlo
  if (status === "unprovisioned") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/30 p-8 text-center">
        <div className="mb-4 rounded-full bg-accent/10 p-4">
          <Workflow size={32} className="text-accent" />
        </div>
        <h3 className="text-xl font-semibold">Aprovisiona tu instancia de N8N</h3>
        <p className="mt-2 max-w-sm text-sm text-secondary">
          Crea tu propio espacio de automatización para conectar APIs, gestionar flujos de trabajo y programar tareas sin intervención manual.
        </p>
        <div className="mt-6">
          <Button variant="primary" onClick={handleProvision}>
            Crear instancia de N8N
          </Button>
        </div>
      </div>
    );
  }

  // Estado 2: Cargando
  if (status === "provisioning") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-line bg-surface/50 p-8 text-center">
        <Spinner className="h-8 w-8 text-accent" />
        <h3 className="mt-4 text-xl font-semibold">Levantando tu contenedor...</h3>
        <p className="mt-2 max-w-sm text-sm text-secondary">
          Esto puede tardar unos segundos. Estamos configurando tu workspace aislado.
        </p>
      </div>
    );
  }

  // Estado 3: Credenciales listas
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Tu instancia de N8N está lista</h2>
          <p className="mt-1 text-sm text-secondary">
            Accede con estas credenciales para empezar a crear tus flujos.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-good/20 bg-good/10 px-3 py-1 text-xs font-medium text-good">
          Activo
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {/* URL de Acceso */}
        <div className="flex flex-col gap-2 border-b border-line py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">URL de Acceso</p>
            <p className="mt-1 break-all font-mono text-sm text-accent">{credentials?.url}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={credentials?.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90">
              <ExternalLink size={14} /> Abrir
            </a>
          </div>
        </div>

        {/* Usuario */}
        <div className="flex flex-col gap-2 border-b border-line py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Usuario</p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">{credentials?.username}</p>
          </div>
          <button onClick={() => copyToClipboard(credentials?.username || "")} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-secondary transition-colors hover:bg-background hover:text-foreground">
            <Copy size={14} /> Copiar
          </button>
        </div>

        {/* Contraseña */}
        <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Contraseña temporal</p>
            <p className="mt-1 break-all font-mono text-sm text-foreground">
              {showPassword ? credentials?.password : "••••••••••••••••"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setShowPassword(!showPassword)} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-secondary transition-colors hover:bg-background hover:text-foreground">
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
            <button onClick={() => copyToClipboard(credentials?.password || "")} className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-secondary transition-colors hover:bg-background hover:text-foreground">
              <Copy size={14} /> Copiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}