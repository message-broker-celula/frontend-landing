const steps = [
  {
    number: "01",
    title: "Solicita tu base de datos",
    description:
      "Autentícate y pide el aprovisionamiento desde la API. Sin formularios de infraestructura, sin configuración manual.",
    circle: "bg-series-1",
  },
  {
    number: "02",
    title: "El backend despacha la petición",
    description:
      "El servidor traslada la solicitud a un Stored Procedure mediante un repositorio con parámetros tipados, nunca con SQL concatenado.",
    circle: "bg-series-5",
  },
  {
    number: "03",
    title: "SQL Server ejecuta la lógica",
    description:
      "Validaciones, cálculos y asignación de permisos ocurren dentro del motor: Stored Procedures, Views y Functions.",
    circle: "bg-series-2",
  },
  {
    number: "04",
    title: "Monitoreo y ciclo de vida",
    description:
      "Tareas programadas controlan uso de almacenamiento, conexiones concurrentes y expiración por inactividad (TTL).",
    circle: "bg-series-8",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="bg-surface/40 px-6 py-20">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-sm font-medium text-accent">Flujo</span>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            El camino de una petición
          </h2>
        </div>
        <ol className="mt-14 flex flex-col">
          {steps.map((step, index) => (
            <li key={step.number} className="relative flex gap-6 pb-10 last:pb-0">
              {index !== steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-5 top-10 h-[calc(100%-1rem)] w-px bg-line"
                />
              )}
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${step.circle}`}
              >
                {step.number}
              </span>
              <div className="pt-1.5">
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="mt-1 text-sm text-secondary">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
