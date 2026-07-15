import { Database } from "lucide-react";
import { apiUrl, cellUrl, siteConfig } from "@/lib/site-config";

const columns = [
  {
    title: "Producto",
    links: [
      { href: "#how", label: "Cómo funciona" },
      { href: "#limits", label: "Límites" },
    ],
  },
  {
    title: "Recursos",
    links: [{ href: apiUrl, label: "API", external: true }],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line px-6 py-14">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-series-1 to-series-5 text-white">
              <Database size={16} strokeWidth={2.5} />
            </span>
            {siteConfig.cellName}
          </div>
          <p className="mt-3 text-sm text-secondary">
            Bases de datos SQL Server gratuitas para estudiantes y
            desarrolladores. Lógica de negocio 100% en el motor.
          </p>
        </div>
        <div className="flex gap-16">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-medium">{column.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...("external" in link && link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-secondary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {siteConfig.cellName}</p>
        <p>{cellUrl}</p>
      </div>
    </footer>
  );
}
