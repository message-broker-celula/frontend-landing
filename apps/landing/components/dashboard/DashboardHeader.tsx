"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Database, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

export function DashboardHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-series-1 to-series-5 text-white">
            <Database size={16} strokeWidth={2.5} />
          </span>
          <span>{siteConfig.cellName}</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.name ?? "Usuario"}</p>
            <p className="text-xs text-secondary">{user?.email}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            className="px-3 py-2"
            aria-label="Cerrar sesión"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
