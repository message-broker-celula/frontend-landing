"use client";

import Link from "next/link";
import { Database } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { siteConfig } from "@/lib/site-config";
import { Spinner } from "@/components/ui/Spinner";

export default function SiteNav() {
  const { status, needsProvisioning } = useAuth();

  const authHref =
    status === "authenticated"
      ? needsProvisioning
        ? "/provision"
        : "/dashboard"
      : "/login";

  const authLabel =
    status === "loading"
      ? null
      : status === "authenticated"
        ? needsProvisioning
          ? "Continuar"
          : "Panel"
        : "Iniciar sesión";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/#top" className="group flex items-center gap-2 font-medium">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-series-5 to-series-2 text-white shadow-md shadow-series-5/25">
            <Database size={16} strokeWidth={2.5} />
          </span>
          <span className="text-sm sm:text-base">{siteConfig.cellName}</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#features"
            className="hidden text-sm text-secondary transition-colors hover:text-foreground sm:inline"
          >
            Arquitectura
          </Link>
          <Link
            href="/#metrics"
            className="hidden text-sm text-secondary transition-colors hover:text-foreground sm:inline"
          >
            Métricas
          </Link>
          {status === "loading" ? (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line">
              <Spinner className="h-4 w-4" />
            </span>
          ) : (
            <Link
              href={authHref}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-series-5 to-series-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-series-5/25 transition-opacity hover:opacity-90"
            >
              {authLabel}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
