"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CredentialsCard } from "@/components/dashboard/CredentialsCard";
import { StorageMonitor } from "@/components/dashboard/StorageMonitor";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const {
    status,
    database,
    needsProvisioning,
    error,
    refreshSession,
    clearError,
  } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }

    if (status === "authenticated" && needsProvisioning) {
      router.replace("/provision");
    }
  }, [needsProvisioning, router, status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-secondary">
        <Spinner />
        Cargando panel…
      </div>
    );
  }

  if (needsProvisioning || !database) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-secondary">
        <Spinner />
        Redirigiendo al aprovisionamiento…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tu panel</h1>
          <p className="mt-2 text-secondary">
            Credenciales, estado y monitoreo de tu base de datos SQL Server.
          </p>
        </div>

        {error ? (
          <Alert
            tone="error"
            title="Error al actualizar la sesión"
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  clearError();
                  void refreshSession();
                }}
              >
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : null}

        <CredentialsCard database={database} />
        <StorageMonitor database={database} />

        <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-secondary">
          ¿Necesitas la documentación de la API?{" "}
          <Link href="/#how" className="font-medium text-accent hover:underline">
            Revisa cómo funciona la plataforma
          </Link>
          .
        </div>
      </main>
    </div>
  );
}
