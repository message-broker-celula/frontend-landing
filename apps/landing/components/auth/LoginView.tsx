"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";
import { AuthButtons } from "@/components/auth/AuthButtons";
import { useAuth } from "@/lib/auth/context";
import { siteConfig } from "@/lib/site-config";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

type AuthTab = "login" | "register";

export default function LoginView() {
  const router = useRouter();
  const { status, user, needsProvisioning, signOut } = useAuth();
  const [tab, setTab] = useState<AuthTab>("login");

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const timer = window.setTimeout(() => {
      router.replace(needsProvisioning ? "/provision" : "/dashboard");
    }, 600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [needsProvisioning, router, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-secondary">
        <Spinner />
        Cargando…
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface/90 p-8 text-center shadow-xl backdrop-blur">
          <Spinner className="mx-auto h-6 w-6" />
          <p className="mt-4 text-sm text-secondary">
            Hola, {user.name || user.email}. Redirigiendo…
          </p>
          <Button variant="ghost" className="mt-4" onClick={signOut}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="bg-dot-grid pointer-events-none absolute inset-0" />
      <div className="hero-orbs pointer-events-none opacity-70" aria-hidden>
        <span className="hero-orb hero-orb-1 !bg-series-5" />
        <span className="hero-orb hero-orb-2 !bg-series-2" />
        <span className="hero-orb hero-orb-3 !bg-series-5/70" />
      </div>

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-medium"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-series-5 to-series-2 text-white shadow-md shadow-series-5/30">
            <Database size={18} strokeWidth={2.5} />
          </span>
          <span>{siteConfig.cellName}</span>
        </Link>

        <div className="rounded-3xl border border-line bg-surface/90 p-6 shadow-xl backdrop-blur sm:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-background/70 p-1">
            <button
              type="button"
              onClick={() => {
                setTab("login");
              }}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
                tab === "login"
                  ? "bg-gradient-to-r from-series-5 to-series-2 text-white shadow-md shadow-series-5/20"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
              }}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
                tab === "register"
                  ? "bg-gradient-to-r from-series-5 to-series-2 text-white shadow-md shadow-series-5/20"
                  : "text-secondary hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {tab === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </h1>
            <p className="mt-2 text-sm text-secondary">
              {tab === "login"
                ? "Accede con Google o GitHub para gestionar tu base de datos."
                : "Regístrate con Google o GitHub. Tu base SQL Server se aprovisionará al entrar."}
            </p>
          </div>

          <div className="mt-8">
            <AuthButtons
              googleClassName="border-series-5/40 text-series-5 hover:border-series-5 hover:bg-series-5/10"
              githubClassName="border-series-2/40 text-series-2 hover:border-series-2 hover:bg-series-2/10"
            />
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            Al continuar aceptas el uso del servicio con límites de almacenamiento,
            rate limiting y TTL automático.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-secondary">
          <Link href="/" className="font-medium text-series-5 hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
