"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Database, LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useProvisioning } from "@/lib/hooks/useProvisioning";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function ProvisioningScreen() {
  const router = useRouter();
  const { status, signOut } = useAuth();
  const { phase, message, error, start } = useProvisioning();
  const [dbName, setDbName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [router, status]);

  useEffect(() => {
    if (phase !== "success") {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace("/dashboard");
    }, 1_400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [phase, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-secondary">
        <Spinner />
        Preparando sesión…
      </div>
    );
  }

  // Manejador del formulario
  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    void start(dbName.trim() || undefined);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="bg-dot-grid pointer-events-none absolute inset-0" />
      <div className="hero-orbs pointer-events-none" aria-hidden>
        <span className="hero-orb hero-orb-1" />
        <span className="hero-orb hero-orb-2" />
        <span className="hero-orb hero-orb-3" />
      </div>

      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-surface/90 p-8 text-center shadow-xl backdrop-blur">
        
        {/* 🟢 FASE: ÉXITO */}
        {phase === "success" ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-good/10 text-good">
              <CheckCircle2 size={32} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Base de datos lista
            </h1>
            <p className="mt-2 text-secondary">
              {message ?? "Redirigiendo a tu panel…"}
            </p>
          </>
        ) : null}

        {/* 🔴 FASE: ERROR */}
        {phase === "error" ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-series-6/10 text-series-6">
              <Database size={32} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              No se pudo aprovisionar
            </h1>
            <div className="mt-4 text-left">
              <Alert tone="error">{error}</Alert>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => void start(dbName.trim() || undefined)}>
                Reintentar
              </Button>
              <Button variant="secondary" onClick={signOut}>
                Cerrar sesión
              </Button>
            </div>
          </>
        ) : null}

        {/* ⏳ FASE: CARGANDO */}
        {(phase === "starting" || phase === "polling") ? (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <LoaderCircle size={32} className="animate-spin" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Creando tu base de datos
            </h1>
            <p className="mt-2 text-secondary">
              Estamos aprovisionando tu instancia. Esto suele tardar unos segundos.
            </p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-line/70">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-series-1 to-series-5" />
            </div>
            <p className="mt-4 text-sm text-muted">
              {message ?? "Preparando almacenamiento, permisos y acceso…"}
            </p>
          </>
        ) : null}

        {/* 📝 FASE: IDLE (Formulario inicial) */}
        {phase === "idle" && (
          <>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Database size={32} />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Aprovisiona tu base de datos
            </h1>
            <p className="mt-2 text-secondary">
              Ponle un nombre a tu proyecto para crear tu instancia gratuita.
            </p>

            <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs uppercase tracking-wide text-muted">Nombre de la base de datos</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="mi_proyecto"
                  className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
              <Button type="submit" className="w-full">
                Crear Base de Datos
              </Button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}