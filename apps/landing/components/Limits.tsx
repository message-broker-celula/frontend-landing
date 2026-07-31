import { Clock4, Database, Gauge, Users, type LucideIcon } from "lucide-react";

const limits: {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
}[] = [
  {
    icon: Database,
    value: "20 MB",
    label: "Almacenamiento máximo por base de datos",
    color: "text-series-1",
  },
  {
    icon: Users,
    value: "Limitadas",
    label: "Conexiones concurrentes por usuario",
    color: "text-series-5",
  },
  {
    icon: Gauge,
    value: "Por minuto",
    label: "Rate limiting por IP / usuario",
    color: "text-series-8",
  },
  {
    icon: Clock4,
    value: "Automático",
    label: "Pausa o elimina bases de datos inactivas (TTL)",
    color: "text-series-2",
  },
];

export default function Limits() {
  return (
    <section id="limits" className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="text-sm font-medium text-accent">Uso justo</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Límites del servicio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            Es un servicio gratuito para aprendizaje y prototipado: estos
            límites existen para mantenerlo disponible para todos.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {limits.map(({ icon: Icon, value, label, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <Icon size={18} className={color} />
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                {value}
              </p>
              <p className="mt-1 text-sm text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
