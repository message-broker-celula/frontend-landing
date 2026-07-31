"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top", label: "Inicio" },
  { id: "features", label: "Arquitectura" },
  { id: "how", label: "Flujo" },
  { id: "metrics", label: "Métricas" },
  { id: "limits", label: "Límites" },
];

export default function SectionNav() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-5 sm:flex">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-label={section.label}
          aria-current={active === section.id ? "true" : undefined}
          className="group relative flex h-4 w-4 items-center justify-center"
        >
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === section.id
                ? "h-2.5 w-2.5 bg-gradient-to-br from-series-1 to-series-5"
                : "h-1.5 w-1.5 bg-line group-hover:bg-muted"
            }`}
          />
          <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-md border border-line bg-surface px-2 py-1 text-xs text-secondary opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            {section.label}
          </span>
        </a>
      ))}
    </nav>
  );
}
