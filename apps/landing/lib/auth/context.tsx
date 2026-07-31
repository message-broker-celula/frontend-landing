"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { fetchCurrentUser, fetchUserDatabase } from "@/lib/api/endpoints";
import type { AuthUser, UserDatabase } from "@/lib/api/types";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/auth/storage";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionSnapshot {
  user: AuthUser;
  database: UserDatabase | null;
  needsProvisioning: boolean;
}

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  database: UserDatabase | null;
  token: string | null;
  error: string | null;
  needsProvisioning: boolean;
  signInWithToken: (token: string) => Promise<SessionSnapshot>;
  refreshSession: () => Promise<SessionSnapshot | null>;
  signOut: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isMissingDatabase(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 204);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [database, setDatabase] = useState<UserDatabase | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(
    async (
      accessToken: string,
      options: { silent?: boolean } = {},
    ): Promise<SessionSnapshot> => {
      setStatus("loading");
      if (!options.silent) {
        setError(null);
      }

      try {
        const nextUser = await fetchCurrentUser(accessToken);
        let nextDatabase: UserDatabase | null = null;

        try {
          nextDatabase = await fetchUserDatabase(accessToken);
        } catch (databaseError) {
          if (!isMissingDatabase(databaseError)) {
            throw databaseError;
          }
        }

        const snapshot: SessionSnapshot = {
          user: nextUser,
          database: nextDatabase,
          needsProvisioning:
            !nextDatabase ||
            nextDatabase.status === "provisioning" ||
            nextDatabase.status === "error",
        };

        setStoredToken(accessToken);
        setToken(accessToken);
        setUser(nextUser);
        setDatabase(nextDatabase);
        setStatus("authenticated");
        setError(null);
        return snapshot;
      } catch (loadError) {
        clearStoredToken();
        setToken(null);
        setUser(null);
        setDatabase(null);
        setStatus("unauthenticated");
        if (!options.silent) {
          setError(
            getErrorMessage(
              loadError,
              "No se pudo restaurar la sesión. Vuelve a iniciar sesión.",
            ),
          );
        }
        throw loadError;
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(() => {
      void (async () => {
        const stored = getStoredToken();
        if (!stored) {
          if (!cancelled) {
            setStatus("unauthenticated");
          }
          return;
        }

        try {
          await loadSession(stored, { silent: true });
        } catch {
          // Expired or invalid tokens fall back to the signed-out state.
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loadSession]);

  const signInWithToken = useCallback(
    async (accessToken: string) => loadSession(accessToken),
    [loadSession],
  );

  const refreshSession = useCallback(async () => {
    const current = token ?? getStoredToken();
    if (!current) {
      setStatus("unauthenticated");
      return null;
    }

    return loadSession(current);
  }, [loadSession, token]);

  const signOut = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setDatabase(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const needsProvisioning = useMemo(() => {
    if (status !== "authenticated") {
      return false;
    }

    if (!database) {
      return true;
    }

    return database.status === "provisioning" || database.status === "error";
  }, [database, status]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      database,
      token,
      error,
      needsProvisioning,
      signInWithToken,
      refreshSession,
      signOut,
      clearError,
    }),
    [
      status,
      user,
      database,
      token,
      error,
      needsProvisioning,
      signInWithToken,
      refreshSession,
      signOut,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
