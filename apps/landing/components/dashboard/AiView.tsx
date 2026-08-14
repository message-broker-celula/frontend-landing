"use client";

import { useEffect, useState } from "react";
import { Sparkles, Plus, Trash2, Copy, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { useAuth } from "@/lib/auth/context";
import { fetchApiKeyStatus, createApiKey, rotateApiKey, revokeApiKey, fetchApiUsage } from "@/lib/api/endpoints";
import type { ApiKeyStatus, ApiKeyResponse, ApiUsage } from "@/lib/api/types";

export function AiView() {
  const { token, signOut } = useAuth();
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatus | null>(null);
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<ApiKeyResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    setActionError(null);
    try {
      const status = await fetchApiKeyStatus(token);
      setKeyStatus(status);
      try {
        const usageData = await fetchApiUsage(token);
        setUsage(usageData);
      } catch { /* El usage podría fallar si no hay datos aún, lo ignoramos */ }
    } catch (err: any) {
      // 400 significa que no tiene llave creada todavía
      if (err.status === 400) {
        setKeyStatus(null);
      } else {
        setActionError("No se pudo cargar la información del servicio de IA.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleGenerate = async () => {
    if (!token) return;
    setActionError(null);
    try {
      const newKey = await createApiKey(token);
      setGeneratedKey(newKey);
      setIsModalOpen(true);
      loadData(); // Recargamos el estado para que aparezca como activa
    } catch (err: any) {
      setActionError(err.message || "Error al generar la API Key.");
    }
  };

  const handleRotate = async () => {
    if (!token) return;
    if (!confirm("¿Estás seguro? La llave actual dejará de funcionar inmediatamente.")) return;
    setActionError(null);
    try {
      const newKey = await rotateApiKey(token);
      setGeneratedKey(newKey);
      setIsModalOpen(true);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Error al rotar la API Key.");
    }
  };

  const handleRevoke = async () => {
    if (!token) return;
    if (!confirm("¿Revocar acceso? Tendrás que generar una nueva llave para usar el servicio.")) return;
    setActionError(null);
    try {
      await revokeApiKey(token);
      setKeyStatus(null);
      setUsage(null);
    } catch (err: any) {
      setActionError(err.message || "Error al revocar la API Key.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-secondary">
        <Spinner /> Cargando servicio de IA...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {actionError && (
        <Alert tone="error" title="Error de IA">{actionError}</Alert>
      )}

      {/* Estado: Sin API Key */}
      {!keyStatus && (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/30 p-8 text-center">
          <div className="mb-4 rounded-full bg-accent/10 p-4">
            <Sparkles size={32} className="text-accent" />
          </div>
          <h3 className="text-xl font-semibold">Activa tu acceso a la IA</h3>
          <p className="mt-2 max-w-sm text-sm text-secondary">
            Genera tu API Key para integrar inteligencia artificial en tus proyectos.
          </p>
          <div className="mt-6">
            <Button onClick={handleGenerate}>
              <Plus size={16} className="mr-1" /> Generar API Key
            </Button>
          </div>
        </div>
      )}

      {/* Estado: API Key Activa */}
      {keyStatus && (
        <>
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Tu API Key</h2>
                <p className="mt-1 text-sm text-secondary">
                  Usa esta llave en tus peticiones HTTP (<code className="text-accent">Authorization: Bearer sk_live_...</code>).
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${keyStatus.can_call_api ? "bg-good/10 text-good border-good/20" : "bg-muted/10 text-muted border-muted/20"}`}>
                {keyStatus.status}
              </span>
            </div>

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
                <p className="text-xs text-muted">Prefijo de la llave</p>
                <p className="mt-1 font-mono text-foreground">{keyStatus.key_prefix}...</p>
              </div>
              <div className="rounded-xl border border-line bg-background/60 px-3 py-2">
                <p className="text-xs text-muted">Último uso</p>
                <p className="mt-1 font-medium text-foreground">
                  {keyStatus.last_used_at ? new Date(keyStatus.last_used_at).toLocaleString() : "Sin uso aún"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={handleRotate}>
                <RefreshCw size={16} className="mr-1" /> Rotar Llave
              </Button>
              <Button variant="secondary" onClick={handleRevoke} className="hover:bg-red-500/10 hover:text-red-500">
                <Trash2 size={16} className="mr-1" /> Revocar Acceso
              </Button>
            </div>
          </div>

          {/* Consumo */}
          {usage && (
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-tight mb-4">Consumo de IA</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-line bg-background/60 p-3">
                  <p className="text-xs text-muted">Peticiones Totales</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{usage.total_requests}</p>
                </div>
                <div className="rounded-xl border border-line bg-background/60 p-3">
                  <p className="text-xs text-muted">Tokens Usados</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{usage.total_tokens.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-line bg-background/60 p-3">
                  <p className="text-xs text-muted">Límite Diario</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{keyStatus.limits.daily_token_limit.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-line bg-background/60 p-3">
                  <p className="text-xs text-muted">Límite Mensual</p>
                  <p className="mt-1 text-xl font-bold text-foreground">{keyStatus.limits.monthly_token_limit.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Seguridad (Crear/Rotar) */}
      {isModalOpen && generatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-good/10 p-2">
                  <Sparkles size={20} className="text-good" />
                </div>
                <h3 className="text-lg font-semibold">Llave generada con éxito</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 rounded-lg border border-good/30 bg-good/10 p-4 text-sm text-good flex items-start gap-2">
              <AlertTriangle size={18} className="shrink-0" />
              <p>
                <strong>Importante:</strong> Copia esta llave ahora mismo. Por seguridad, no podrás volver a verla.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-background p-3">
              <code className="flex-1 break-all font-mono text-sm text-foreground">{generatedKey.api_key}</code>
              <button onClick={() => copyToClipboard(generatedKey.api_key)} className="shrink-0 rounded-md bg-accent p-2 text-white hover:opacity-90">
                <Copy size={16} />
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-line bg-background p-3">
              <p className="text-xs text-muted">Base URL para peticiones:</p>
              <p className="mt-1 break-all font-mono text-sm text-foreground">{generatedKey.base_url}</p>
            </div>

            <div className="mt-6">
              <Button variant="primary" className="w-full" onClick={() => setIsModalOpen(false)}>
                He copiado mi llave, cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}