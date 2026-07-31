"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/api/errors";
import { fetchMetrics } from "@/lib/api/endpoints";
import type { PublicMetrics } from "@/lib/api/types";

const DEFAULT_REFRESH_MS = 30_000;

interface UseMetricsResult {
  metrics: PublicMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMetrics(
  refreshIntervalMs: number = DEFAULT_REFRESH_MS,
): UseMetricsResult {
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMetrics();
      if (requestId !== requestIdRef.current) {
        return;
      }
      setMetrics(data);
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(
        getErrorMessage(
          fetchError,
          "No se pudieron cargar las métricas públicas.",
        ),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void refresh();
    }, 0);

    if (refreshIntervalMs <= 0) {
      return () => {
        window.clearTimeout(initialTimer);
        requestIdRef.current += 1;
      };
    }

    const intervalTimer = window.setInterval(() => {
      void refresh();
    }, refreshIntervalMs);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalTimer);
      requestIdRef.current += 1;
    };
  }, [refresh, refreshIntervalMs]);

  return { metrics, loading, error, refresh };
}
