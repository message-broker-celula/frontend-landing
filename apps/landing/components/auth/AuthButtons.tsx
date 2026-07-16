"use client";

import { useState, type ReactNode } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { startOAuth } from "@/lib/auth/oauth";
import type { AuthProvider } from "@/lib/api/types";
import { getErrorMessage } from "@/lib/api/errors";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.13H12v4.03h5.4a4.62 4.62 0 0 1-2 3.03v2.51h3.24c1.9-1.75 2.96-4.33 2.96-7.44Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.51c-.9.6-2.05.96-3.37.96-2.59 0-4.78-1.75-5.56-4.1H3.09v2.59A9.99 9.99 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        d="M6.44 13.92A6 6 0 0 1 6.13 12c0-.67.12-1.32.31-1.92V7.49H3.09A10 10 0 0 0 2 12c0 1.61.39 3.14 1.09 4.51l3.35-2.59Z"
      />
      <path
        fill="currentColor"
        d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C16.95 2.97 14.7 2 12 2A9.99 9.99 0 0 0 3.09 7.49l3.35 2.59C7.22 7.73 9.41 5.98 12 5.98Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.35 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .26.18.58.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function IconAuthButton({
  label,
  loading,
  disabled,
  onClick,
  className = "",
  children,
}: {
  label: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${className}`}
    >
      {loading ? <Spinner className="h-5 w-5" label={label} /> : children}
    </button>
  );
}

export function AuthButtons({
  layout = "row",
  googleClassName = "border-series-5/40 text-series-5 hover:border-series-5 hover:bg-series-5/10",
  githubClassName = "border-series-2/40 text-series-2 hover:border-series-2 hover:bg-series-2/10",
}: {
  layout?: "row" | "stack";
  googleClassName?: string;
  githubClassName?: string;
}) {
  const [loadingProvider, setLoadingProvider] = useState<AuthProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (provider: AuthProvider) => {
    setError(null);
    setLoadingProvider(provider);

    try {
      startOAuth(provider);
    } catch (signInError) {
      setLoadingProvider(null);
      setError(
        getErrorMessage(
          signInError,
          "No se pudo iniciar el inicio de sesión. Inténtalo de nuevo.",
        ),
      );
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div
        className={
          layout === "stack"
            ? "flex flex-col items-center gap-3"
            : "flex flex-row items-center justify-center gap-4"
        }
      >
        <IconAuthButton
          label="Continuar con Google"
          loading={loadingProvider === "google"}
          disabled={loadingProvider !== null}
          className={googleClassName}
          onClick={() => {
            handleSignIn("google");
          }}
        >
          <GoogleIcon />
        </IconAuthButton>
        <IconAuthButton
          label="Continuar con GitHub"
          loading={loadingProvider === "github"}
          disabled={loadingProvider !== null}
          className={githubClassName}
          onClick={() => {
            handleSignIn("github");
          }}
        >
          <GitHubIcon />
        </IconAuthButton>
      </div>
      {error ? (
        <Alert tone="error" title="Error de autenticación">
          {error}
        </Alert>
      ) : null}
    </div>
  );
}
