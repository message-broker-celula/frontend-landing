import { Database } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function FloatingBrand() {
  return (
    <a
      href="#top"
      aria-label="Volver al inicio"
      className="group fixed left-6 top-6 z-40 flex items-center gap-2"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-series-1 to-series-5 text-white shadow-md shadow-series-1/20">
        <Database size={16} strokeWidth={2.5} />
      </span>
      <span className="rounded-full border border-line bg-surface/80 px-3 py-1 text-sm font-medium opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        {siteConfig.cellName}
      </span>
    </a>
  );
}
