import {
  Database,
  GitBranch,
  Globe,
  ShieldCheck,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";

const colorStyles = {
  "series-1": {
    icon: "bg-series-1/10 text-series-1",
    card: "hover:border-series-1/40 hover:shadow-series-1/10",
  },
  "series-2": {
    icon: "bg-series-2/10 text-series-2",
    card: "hover:border-series-2/40 hover:shadow-series-2/10",
  },
  "series-3": {
    icon: "bg-series-3/10 text-series-3",
    card: "hover:border-series-3/40 hover:shadow-series-3/10",
  },
  "series-4": {
    icon: "bg-series-4/10 text-series-4",
    card: "hover:border-series-4/40 hover:shadow-series-4/10",
  },
  "series-5": {
    icon: "bg-series-5/10 text-series-5",
    card: "hover:border-series-5/40 hover:shadow-series-5/10",
  },
  "series-8": {
    icon: "bg-series-8/10 text-series-8",
    card: "hover:border-series-8/40 hover:shadow-series-8/10",
  },
} as const;

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  color: keyof typeof colorStyles;
}[] = [
  {
    icon: Database,
    title: "Lógica 100% en base de datos",
    description:
      "Stored Procedures, Views y Functions resuelven cada regla de negocio. El backend no valida ni calcula: solo despacha.",
    color: "series-1",
  },
  {
    icon: GitBranch,
    title: "Backend como mediador",
    description:
      "Repositorios desacoplados mediante inversión de dependencias (DIP): el backend expone contratos, la implementación solo invoca SPs.",
    color: "series-5",
  },
  {
    icon: ShieldCheck,
    title: "Seguro por diseño",
    description:
      "Rate limiting, parámetros obligatorios en cada SP y prevención de inyección SQL en todas las capas.",
    color: "series-2",
  },
  {
    icon: Timer,
    title: "Recursos controlados",
    description:
      "Límite estricto de almacenamiento y conexiones concurrentes por base de datos, con expiración automática por inactividad (TTL).",
    color: "series-8",
  },
  {
    icon: Globe,
    title: "Subdominio dedicado",
    description:
      "Cada célula recibe su propio espacio de nombres para frontend y para N servicios de backend independientes.",
    color: "series-4",
  },
  {
    icon: Sparkles,
    title: "Listo para desarrolladores",
    description:
      "Aprovisiona, conecta y empieza a construir sin gestionar infraestructura de base de datos.",
    color: "series-3",
  },
];

export default function Features() {
  return (
    <section id="features" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="text-sm font-medium text-accent">Arquitectura</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Cómo funciona la plataforma
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className={`group rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${colorStyles[color].card}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorStyles[color].icon}`}
              >
                <Icon size={20} />
              </span>
              <h3 className="mt-4 text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-secondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
