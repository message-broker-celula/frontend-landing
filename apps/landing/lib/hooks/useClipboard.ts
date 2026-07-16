"use client";

import { useCallback, useState } from "react";

interface UseClipboardResult {
  copied: boolean;
  copy: (value: string) => Promise<boolean>;
  reset: () => void;
}

export function useClipboard(resetMs = 2_000): UseClipboardResult {
  const [copied, setCopied] = useState(false);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
        }, resetMs);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetMs],
  );

  return { copied, copy, reset };
}
