"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/api/errors";

function readCallbackToken(params: URLSearchParams): string | null {
  return (
    params.get("access_token") ??
    params.get("token") ??
    params.get("accessToken")
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithToken } = useAuth();
  const startedRef = useRef(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const accessToken = readCallbackToken(searchParams);
  // error_description is the human-readable Spanish message the backend
  // generates (e.g. "Ya existe una cuenta con este correo registrada con
  // otro proveedor..."); error is just the short machine code (e.g.
  // "business_rule_violation"). Both are always present together on a
  // callback failure, so prefer the readable one and only fall back to the
  // code if a description is ever missing.
  const callbackError =
    searchParams.get("error_description") ?? searchParams.get("error");
  const missingTokenError = !accessToken && !callbackError
    ? "No se recibió un token de acceso. Vuelve a iniciar sesión desde la página principal."
    : null;
  const error = callbackError ?? missingTokenError ?? runtimeError;

  useEffect(() => {
    if (error || !accessToken || startedRef.current) {
      return;
    }

    startedRef.current = true;

    // 🛡️ Seguridad: Sacamos el token de la URL visible inmediatamente
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }

    void signInWithToken(accessToken)
      .then((session) => {
        router.replace(session.needsProvisioning ? "/provision" : "/dashboard");
      })
      .catch((signInError) => {
        setRuntimeError(
          getErrorMessage(
            signInError,
            "No se pudo completar el inicio de sesión.",
          ),
        );
      });
  }, [accessToken, error, router, signInWithToken]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4">
          <Alert tone="error" title="Error de autenticación">
            {error}
          </Alert>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
            >
              Volver al inicio
            </Link>
            <Button
              variant="secondary"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-secondary">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">Completando inicio de sesión…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-secondary">
          <Spinner className="h-8 w-8" />
          <p className="text-sm">Completando inicio de sesión…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}