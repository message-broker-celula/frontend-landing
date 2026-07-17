"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import {
  fetchProvisioningStatus,
  fetchUserDatabase,
  provisionDatabase,
} from "@/lib/api/endpoints";
import type { DatabaseStatus, UserDatabase } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";

const POLL_INTERVAL_MS = 2_500;

type ProvisionPhase = "idle" | "starting" | "polling" | "success" | "error";

interface UseProvisioningResult {
  phase: ProvisionPhase;
  status: DatabaseStatus | null;
  message: string | null;
  database: UserDatabase | null;
  error: string | null;
  start: () => Promise<void>;
}

function hasCredentials(
  value: UserDatabase | { status: DatabaseStatus },
): value is UserDatabase {
  return "host" in value && "databaseName" in value;
}

export function useProvisioning(): UseProvisioningResult {
  const { token, database: sessionDatabase, refreshSession } = useAuth();
  const [phase, setPhase] = useState<ProvisionPhase>("idle");
  const [status, setStatus] = useState<DatabaseStatus | null>(
    sessionDatabase?.status ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [database, setDatabase] = useState<UserDatabase | null>(sessionDatabase);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  const finishSuccess = useCallback(
    async (nextDatabase: UserDatabase) => {
      if (!activeRef.current) {
        return;
      }
      setDatabase(nextDatabase);
      setStatus(nextDatabase.status);
      setPhase("success");
      setMessage("Tu base de datos está lista.");
      await refreshSession();
    },
    [refreshSession],
  );

  const pollUntilReady = useCallback(
    async (accessToken: string) => {
      setPhase("polling");

      while (activeRef.current) {
        try {
          const current = await fetchProvisioningStatus(accessToken);
          if (!activeRef.current) {
            return;
          }

          setStatus(current.status);
          setMessage(current.message ?? null);

          if (current.status === "active") {
            const ready = await fetchUserDatabase(accessToken);
            await finishSuccess(ready);
            return;
          }

          if (current.status === "error" || current.status === "deleted") {
            setPhase("error");
            setError(
              current.message ??
                "El aprovisionamiento falló. Inténtalo de nuevo más tarde.",
            );
            return;
          }
        } catch (pollError) {
          if (!activeRef.current) {
            return;
          }

          // 🛡️ MEJORA ANTI-QA: Si el backend nos bloquea por Rate Limiting (429),
          // no mostramos error fatal. Simplemente dejamos que el ciclo continúe 
          // y vuelva a preguntar en 2.5s.
          if (pollError instanceof ApiError && pollError.status === 429) {
            // Silenciamos el error de rate limiting para no asustar al usuario
            // y dejamos que el flujo llegue al setTimeout de abajo.
          } else {
            setPhase("error");
            setError(
              getErrorMessage(
                pollError,
                "No se pudo consultar el estado del aprovisionamiento.",
              ),
            );
            return;
          }
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, POLL_INTERVAL_MS);
        });
      }
    },
    [finishSuccess],
  );

  const start = useCallback(async () => {
    if (!token || startedRef.current) {
      return;
    }

    startedRef.current = true;
    setError(null);
    setPhase("starting");

    try {
      if (sessionDatabase?.status === "active") {
        await finishSuccess(sessionDatabase);
        return;
      }

      if (sessionDatabase?.status === "provisioning") {
        await pollUntilReady(token);
        return;
      }

      const result = await provisionDatabase(token);

      if (!activeRef.current) {
        return;
      }

      if (hasCredentials(result) && result.status === "active") {
        await finishSuccess(result);
        return;
      }

      setStatus(result.status);
      await pollUntilReady(token);
    } catch (startError) {
      if (!activeRef.current) {
        return;
      }

      // Idempotent backends may return 409 when provisioning already started.
      if (startError instanceof ApiError && startError.status === 409) {
        await pollUntilReady(token);
        return;
      }

      startedRef.current = false;
      setPhase("error");
      setError(
        getErrorMessage(
          startError,
          "No se pudo iniciar el aprovisionamiento de la base de datos.",
        ),
      );
    }
  }, [finishSuccess, pollUntilReady, sessionDatabase, token]);

  return {
    phase,
    status,
    message,
    database,
    error,
    start,
  };
}