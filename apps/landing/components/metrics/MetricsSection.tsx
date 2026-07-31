"use client";

import {
  Activity,
  Database,
  HardDrive,
  ShieldCheck,
  Users,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMetrics } from "@/lib/hooks/useMetrics";
import { formatNumber, formatPercent } from "@/lib/format";
import type { PublicMetrics } from "@/lib/api/types";

const metricDefs: {
  key: keyof PublicMetrics;
  label: string;
  icon: LucideIcon;
  color: string;
  format?: (value: number) => string;
}[] = [
  {
    key: "totalUsers",
    label: "Usuarios totales",
    icon: Users,
    color: "text-series-1 bg-series-1/10",
  },
  {
    key: "totalDatabases",
    label: "Bases de datos",
    icon: Database,
    color: "text-series-5 bg-series-5/10",
  },
  {
    key: "activeDatabases",
    label: "Bases activas",
    icon: HardDrive,
    color: "text-series-2 bg-series-2/10",
  },
  {
    key: "totalLogins",
    label: "Inicios de sesión",
    icon: LogIn,
    color: "text-series-8 bg-series-8/10",
  },
  {
    key: "activeUsers",
    label: "Usuarios activos",
    icon: Activity,
    color: "text-series-3 bg-series-3/10",
  },
  {
    key: "availability",
    label: "Disponibilidad",
    icon: ShieldCheck,
    color: "text-good bg-good/10",
    format: (value) => formatPercent(value, 1),
  },
];

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metricDefs.map((metric) => (
        <div
          key={metric.key}
          className="rounded-2xl border border-line bg-surface p-5"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-4 h-8 w-24" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export default function MetricsSection() {
  const { metrics, loading, error, refresh } = useMetrics();

  return (
    <section id="metrics" className="bg-surface/40 px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="text-sm font-medium text-accent">Métricas</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Estado de la plataforma
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-secondary">
            Datos públicos actualizados automáticamente cada 30 segundos.
          </p>
        </div>

        <div className="mt-12">
          {error ? (
            <Alert
              tone="error"
              title="No se pudieron cargar las métricas"
              action={
                <Button variant="secondary" onClick={() => void refresh()}>
                  Reintentar
                </Button>
              }
            >
              {error}
            </Alert>
          ) : null}

          {loading && !metrics ? <MetricsSkeleton /> : null}

          {metrics ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metricDefs.map(({ key, label, icon: Icon, color, format }) => (
                <article
                  key={key}
                  className="rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon size={20} />
                  </span>
                  <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                    {format
                      ? format(metrics[key])
                      : formatNumber(metrics[key])}
                  </p>
                  <p className="mt-1 text-sm text-secondary">{label}</p>
                </article>
              ))}
            </div>
          ) : null}

          {!loading && !metrics && !error ? (
            <Alert tone="info" title="Sin datos">
              Todavía no hay métricas disponibles para esta célula.
            </Alert>
          ) : null}
        </div>
      </div>
    </section>
  );
}
