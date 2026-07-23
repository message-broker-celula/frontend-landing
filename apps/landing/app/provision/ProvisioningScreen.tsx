"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useProvisioning } from "@/lib/hooks/useProvisioning";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function ProvisioningScreen() {
  const { phase, message, error, start } = useProvisioning();
  const router = useRouter();

  // Iniciar el aprovisionamiento automáticamente al montar el componente
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirigir al dashboard cuando sea exitoso
  useEffect(() => {
    if (phase === "success") {
      const timer = window.setTimeout(() => {
        router.replace("/dashboard");
      }, 2000); // Pausa de 2s para que el usuario lea el mensaje de éxito
      return () => window.clearTimeout(timer);
    }
  }, [phase, router]);

  const isLoading = phase === "starting" || phase === "polling";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Fondos visuales (orbes y puntos) */}
      <div className="bg-dot-grid pointer-events-none absolute inset-0 z-0" />
      <div className="hero-orbs pointer-events-none absolute inset-0 z-0">
        <div className="hero-orb-1 !bg-series-5/70" />
        <div className="hero-orb-2 !bg-series-1/70" />
      </div>

      {/* Tarjeta principal */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-line bg-surface/90 p-8 shadow-2xl backdrop-blur-sm sm:p-10 text-center">
        
        {/* Estado de Carga (starting / polling) */}
        {isLoading && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-series-5/10 text-series-5">
              <Spinner className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              Aprovisionando tu base de datos
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {message || "Estamos creando tu entorno y generando credenciales seguras. Esto solo tomará unos segundos."}
            </p>
            
            {/* Puntos de carga animados */}
            <div className="mt-8 flex justify-center gap-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-series-5 [animation-delay:-0.3s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-series-5 [animation-delay:-0.15s]"></span>
              <span className="h-2 w-2 animate-bounce rounded-full bg-series-5"></span>
            </div>
          </>
        )}

        {/* Estado de Éxito */}
        {phase === "success" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-good/10 text-good">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              ¡Todo listo!
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {message || "Tu base de datos está activa. Redirigiéndote al panel de control..."}
            </p>
          </>
        )}

        {/* Estado de Error */}
        {phase === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-series-6/10 text-series-6">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              Ocurrió un problema
            </h1>
            <div className="mt-4 text-left">
              <Alert tone="error" title="Error de aprovisionamiento">
                {error || "No se pudo crear la base de datos en este momento."}
              </Alert>
            </div>
            <div className="mt-6">
              {/* El botón de reintentar recarga la página para volver a disparar el flujo */}
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}