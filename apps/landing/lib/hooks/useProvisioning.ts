"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import {
  fetchUserDatabases,
  provisionDatabase,
} from "@/lib/api/endpoints";
import type { DatabaseStatus, DatabaseInstance } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/context";

const POLL_INTERVAL_MS = 2_500;

type ProvisionPhase = "idle" | "starting" | "polling" | "success" | "error";

interface UseProvisioningResult {
  phase: ProvisionPhase;
  status: DatabaseStatus | null;
  message: string | null;
  database: DatabaseInstance | null;
  error: string | null;
  start: (dbName?: string) => Promise<void>;
}

export function useProvisioning(): UseProvisioningResult {
  const { token, database: sessionDatabase, refreshSession } = useAuth();
  const [phase, setPhase] = useState<ProvisionPhase>("idle");
  const [status, setStatus] = useState<DatabaseStatus | null>(
    sessionDatabase?.status ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [database, setDatabase] = useState<DatabaseInstance | null>(sessionDatabase);
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
    async (nextDatabase: DatabaseInstance) => {
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
          const response = await fetchUserDatabases(accessToken);
          if (!activeRef.current) {
            return;
          }

          const currentDb = response.databases?.[0] || null;

          if (currentDb) {
            setStatus(currentDb.status);

            if (currentDb.status === "active") {
              await finishSuccess(currentDb);
              return;
            }

            if (currentDb.status === "error" || currentDb.status === "deleted") {
              setPhase("error");
              setError(
                "El aprovisionamiento falló o la base de datos fue eliminada. Inténtalo de nuevo.",
              );
              return;
            }
          }
        } catch (pollError) {
          if (!activeRef.current) {
            return;
          }

          if (!(pollError instanceof ApiError && pollError.status === 429)) {
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

  const start = useCallback(async (dbName?: string) => {
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

      if (sessionDatabase?.status === "provisioning" || sessionDatabase?.status === "unknown") {
        await pollUntilReady(token);
        return;
      }

      // Disparamos la creación enviando el nombre si existe
      await provisionDatabase(token, dbName);

      if (!activeRef.current) {
        return;
      }

      await pollUntilReady(token);
    } catch (startError) {
      if (!activeRef.current) {
        return;
      }

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