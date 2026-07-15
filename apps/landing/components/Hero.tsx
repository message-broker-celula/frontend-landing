import { ArrowUpRight, Clock4, Database, Gauge, ShieldCheck } from "lucide-react";
import { apiUrl, siteConfig } from "@/lib/site-config";

const chips = [
  { icon: Database, label: "SQL Server", color: "text-series-1" },
  { icon: ShieldCheck, label: "20 MB por proyecto", color: "text-series-2" },
  { icon: Gauge, label: "Rate limiting", color: "text-series-8" },
  { icon: Clock4, label: "TTL automático", color: "text-series-5" },
];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="hero-orbs pointer-events-none" aria-hidden>
        <span className="hero-orb hero-orb-1" />
        <span className="hero-orb hero-orb-2" />
        <span className="hero-orb hero-orb-3" />
      </div>
      <div className="bg-dot-grid pointer-events-none absolute inset-0" />

      <div className="relative flex flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Bases de datos gratuitas,{" "}
          <span className="bg-gradient-to-r from-series-1 via-series-5 to-series-2 bg-clip-text text-transparent">
            listas en segundos
          </span>
        </h1>

        <p className="max-w-2xl text-lg text-secondary sm:text-xl">
          Aprovisiona una base de datos SQL Server para tus proyectos y prácticas.
          Toda la lógica de negocio corre dentro de la base de datos; nuestra API
          solo despacha, autentica y protege el acceso.
        </p>

        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
          {siteConfig.apkUrl ? (
            <a
              href={siteConfig.apkUrl}
              className="rounded-full bg-gradient-to-r from-series-1 to-series-5 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-series-1/25 transition-opacity hover:opacity-90"
            >
              Descargar APK
            </a>
          ) : (
            <span className="cursor-not-allowed rounded-full bg-accent-soft px-6 py-3 text-sm font-medium text-accent/70">
              Descargar APK — próximamente
            </span>
          )}
          <a
            href={apiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-1 rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
          >
            Ver API
            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          {chips.map(({ icon: Icon, label, color }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1.5 text-xs text-secondary backdrop-blur"
            >
              <Icon size={14} className={color} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
