"use client";

import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/lib/hooks/useClipboard";

export function CopyButton({
  value,
  label = "Copiar",
}: {
  value: string;
  label?: string;
}) {
  const { copied, copy } = useClipboard();

  return (
    <button
      type="button"
      onClick={() => {
        void copy(value);
      }}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-secondary transition-colors hover:bg-surface hover:text-foreground"
      aria-label={copied ? "Copiado" : label}
    >
      {copied ? <Check size={14} className="text-good" /> : <Copy size={14} />}
      {copied ? "Copiado" : label}
    </button>
  );
}
