"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { CredentialsCard } from "@/components/dashboard/CredentialsCard";
import { StorageMonitor } from "@/components/dashboard/StorageMonitor";
import { DnsView } from "@/components/dashboard/DnsView";
import { AiView } from "@/components/dashboard/AiView";
import { N8nView } from "@/components/dashboard/N8nView"; // <-- Importamos la nueva vista
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import Link from "next/link";
import { fetchDatabaseCredentials, fetchDatabaseUsage } from "@/lib/api/endpoints";
import type { DatabaseCredentials, DatabaseUsage } from "@/lib/api/types";
import { Logo } from "@/components/Logo";
import { Database, Workflow, Sparkles, Globe, LogOut } from "lucide-react";

type DashboardView = "database" | "n8n" | "ai" | "dns";

export default function DashboardPage() {
  const router = useRouter();
  const {
    status,
    user,
    database,
    token,
    needsProvisioning,
    error,
    refreshSession,
    clearError,
    signOut,
  } = useAuth();

  const [activeView, setActiveView] = useState<DashboardView>("database");
  const [credentials, setCredentials] = useState<DatabaseCredentials | null>(null);
  const [usage, setUsage] = useState<DatabaseUsage | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
      return;
    }
    if (status === "authenticated" && needsProvisioning) {
      router.replace("/provision");
    }
  }, [needsProvisioning, router, status]);

  useEffect(() => {
    if (!token || !database) return;
    let cancelled = false;
    const loadDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const [creds, use] = await Promise.all([
          fetchDatabaseCredentials(token, database.database_id),
          fetchDatabaseUsage(token, database.database_id),
        ]);
        if (!cancelled) {
          setCredentials(creds);
          setUsage(use);
        }
      } catch (err) {
        console.error("Error fetching database details:", err);
      } finally {
        if (!cancelled) setIsLoadingDetails(false);
      }
    };
    loadDetails();
    return () => { cancelled = true; };
  }, [token, database]);

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

  const menuItems = [
    { id: "database", label: "Base de Datos", icon: Database },
    { id: "n8n", label: "Automatización", icon: Workflow },
    { id: "ai", label: "Inteligencia IA", icon: Sparkles },
    { id: "dns", label: "Dominios (DNS)", icon: Globe },
  ] as const;

  return (
    <div className="flex min-h-screen bg-background">
      {/* 📌 SIDEBAR PROFESIONAL */}
      <aside className="hidden w-64 flex-col border-r border-line bg-surface/50 p-4 md:flex">
        <div className="mb-8 px-2">
          <Logo />
        </div>
        
        <nav className="flex flex-1 flex-col gap-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeView === item.id
                  ? "bg-accent/10 text-accent"
                  : "text-secondary hover:bg-background hover:text-foreground"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-line pt-4">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{user?.email || "Usuario"}</p>
            <p className="text-xs text-muted">Cuenta activa</p>
          </div>
          <button 
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* 📌 ÁREA PRINCIPAL (CONTENT) */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
          
          {/* Encabezado dinámico según la vista */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {activeView === "database" && "Tu Base de Datos"}
              {activeView === "n8n" && "Automatización (N8N)"}
              {activeView === "ai" && "Inteligencia Artificial"}
              {activeView === "dns" && "Gestión de Dominios"}
            </h1>
            <p className="mt-2 text-secondary">
              {activeView === "database" && "Credenciales, estado y monitoreo de tu instancia SQL Server."}
              {activeView === "n8n" && "Crea y gestiona tus flujos de trabajo automatizados."}
              {activeView === "ai" && "Genera API Keys para integrar IA en tus proyectos."}
              {activeView === "dns" && "Crea y administra tus propios subdominios."}
            </p>
          </div>

          {/* VISTA: BASE DE DATOS */}
          {activeView === "database" && (
            <>
              {error ? (
                <Alert
                  tone="error"
                  title="Error al actualizar la sesión"
                  action={
                    <Button variant="secondary" onClick={() => { clearError(); void refreshSession(); }}>
                      Reintentar
                    </Button>
                  }
                >
                  {error}
                </Alert>
              ) : null}

              {isLoadingDetails ? (
                <div className="flex items-center justify-center gap-3 py-10 text-secondary">
                  <Spinner /> Obteniendo credenciales…
                </div>
              ) : (
                <>
                  <CredentialsCard database={database} credentials={credentials} />
                  <StorageMonitor database={database} usage={usage} />
                </>
              )}
            </>
          )}

          {/* VISTA: DNS */}
          {activeView === "dns" && (
            <DnsView />
          )}

          {/* VISTA: IA */}
          {activeView === "ai" && (
            <AiView />
          )}

          {/* VISTA: N8N */}
          {activeView === "n8n" && (
            <N8nView />
          )}

          <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-sm text-secondary">
            ¿Necesitas la documentación de la API?{" "}
            <Link href="/#how" className="font-medium text-accent hover:underline">
              Revisa cómo funciona la plataforma
            </Link>
            .
          </div>
        </div>
      </main>
    </div>
  );
}