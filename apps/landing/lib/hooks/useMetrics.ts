"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
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
  const hasDataRef = useRef(false);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    
    // Solo mostramos el spinner de carga si es la primera vez que pedimos los datos
    if (!hasDataRef.current) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchMetrics();
      if (requestId !== requestIdRef.current) {
        return;
      }
      setMetrics(data);
      hasDataRef.current = true;
    } catch (fetchError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      // 🛡️ Blindaje Anti-QA: Si el backend bloquea por Rate Limiting (429),
      // no mostramos un error fatal. Si ya teníamos datos, los dejamos visibles
      // y esperamos al próximo ciclo automático (en 30s).
      if (fetchError instanceof ApiError && fetchError.status === 429) {
        if (!hasDataRef.current) {
          // Solo mostramos error si era la carga inicial y ya nos bloquearon
          setError("El servidor está saturado de peticiones. Inténtalo de nuevo en unos minutos.");
        }
        return;
      }

      setError(
        getErrorMessage(
          fetchError,
          "No se pudieron cargar las métricas públicas.",
        ),
      );
    } finally {
      if (requestId === requestIdRef.current && !hasDataRef.current) {
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