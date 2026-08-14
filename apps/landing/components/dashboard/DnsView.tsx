"use client";

import { useEffect, useState } from "react";
import { Globe, Trash2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/context";
import {
  fetchUserCelulas,
  createCelula,
  fetchCelulaServices,
  createCelulaService,
  deleteCelulaService,
  fetchDnsStatus,
} from "@/lib/api/endpoints";
import type { Celula, CelulaService } from "@/lib/api/types";

export function DnsView() {
  const { token } = useAuth();
  const [celula, setCelula] = useState<Celula | null>(null);
  const [services, setServices] = useState<CelulaService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newServiceName, setNewServiceName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Obtener la célula del usuario
      const celulasRes = await fetchUserCelulas(token);
      if (celulasRes.celulas && celulasRes.celulas.length > 0) {
        const userCelula = celulasRes.celulas[0];
        setCelula(userCelula);
        
        // 2. Si tiene célula, obtener sus servicios (subdominios)
        const servicesRes = await fetchCelulaServices(token, userCelula.celula_id);
        setServices(servicesRes.services || []);
      }
    } catch (err: any) {
      setError("No se pudo cargar la información de tu workspace (célula).");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateCelula = async () => {
    if (!token) return;
    setIsCreating(true);
    setError(null);
    try {
      // Creamos una célula por defecto con el nombre de la celula de la organización
      const newCelula = await createCelula(token, "mbro");
      setCelula(newCelula);
    } catch (err: any) {
      setError("No se pudo inicializar tu workspace para DNS.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !celula || !newServiceName) return;
    setIsCreating(true);
    setError(null);
    try {
      const newService = await createCelulaService(token, celula.celula_id, newServiceName.toLowerCase());
      setServices([newService, ...services]);
      setNewServiceName("");
      
      // Simulamos la propagación: a los 3 segundos chequeamos el estado DNS
      setTimeout(async () => {
        try {
          const status = await fetchDnsStatus(token, celula.celula_id, newService.service_id);
          setServices(prev => prev.map(s => s.service_id === newService.service_id ? { ...s, domain: status.fqdn } : s));
        } catch {}
      }, 3000);

    } catch (err: any) {
      setError(err.message || "No se pudo crear el subdominio. Verifica que el nombre sea válido y no esté en uso.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!token || !celula) return;
    if (!confirm("¿Eliminar este subdominio? Esta acción no se puede deshacer.")) return;
    try {
      await deleteCelulaService(token, celula.celula_id, serviceId);
      setServices(services.filter(s => s.service_id !== serviceId));
    } catch (err: any) {
      setError("No se pudo eliminar el subdominio.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-secondary">
        <Spinner /> Cargando dominios...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert tone="error" title="Error de DNS">{error}</Alert>
      )}

      {/* Si el usuario NO tiene célula */}
      {!celula ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/30 p-8 text-center">
          <div className="mb-4 rounded-full bg-accent/10 p-4">
            <Globe size={32} className="text-accent" />
          </div>
          <h3 className="text-xl font-semibold">Inicia tu workspace de DNS</h3>
          <p className="mt-2 max-w-sm text-sm text-secondary">
            Para crear subdominios personalizados, primero necesitamos inicializar tu espacio de trabajo (célula).
          </p>
          <div className="mt-6">
            <Button onClick={handleCreateCelula} disabled={isCreating}>
              {isCreating ? <Spinner className="mr-2 h-4 w-4" /> : <Plus size={16} className="mr-1" />} Crear Workspace
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Formulario de Creación */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Crear nuevo subdominio</h2>
            <p className="mt-1 text-sm text-secondary">
              El registro tipo A se creará automáticamente apuntando al servidor.
            </p>

            <form onSubmit={handleCreateService} className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-wide text-muted">Nombre del subdominio</label>
                  <div className="mt-1 flex items-center rounded-lg border border-line bg-background px-3">
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="miapp"
                      className="w-full bg-transparent py-2 text-sm text-foreground outline-none"
                      required
                    />
                    <span className="text-sm text-muted">.{celula.name}.coderhivex.com</span>
                  </div>
                </div>
              </div>
              <div>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <Spinner className="mr-2 h-4 w-4" /> : <Plus size={16} className="mr-1" />} Crear Registro DNS
                </Button>
              </div>
            </form>
          </div>

          {/* Tabla de Registros */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-lg font-semibold tracking-tight">Tus dominios activos</h2>
            
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Subdominio</th>
                    <th className="py-3 pr-4 font-medium">Estado</th>
                    <th className="py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-secondary">
                        No tienes dominios creados todavía.
                      </td>
                    </tr>
                  ) : (
                    services.map((svc) => (
                      <tr key={svc.service_id} className="group">
                        <td className="py-3 pr-4 font-mono text-foreground break-all">
                          {svc.domain || `${svc.service_name}.${celula.name}.coderhivex.com`}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="inline-flex items-center rounded-full border bg-good/10 px-2.5 py-0.5 text-xs font-medium text-good border-good/20">
                            Activo
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => handleDelete(svc.service_id)}
                            className="text-muted transition-colors hover:text-red-500"
                            title="Eliminar registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}