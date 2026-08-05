"use client";

import { useState } from "react";
import { Sparkles, Plus, Trash2, Copy, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string; // Lo que se muestra en la tabla (ej. sk-...1234)
  requests: number;
  status: "active" | "revoked";
  createdAt: string;
};

export function AiView() {
  // Datos simulados de ejemplo
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: "1", name: "Producción", keyPrefix: "sk-prod-...8f2a", requests: 1450, status: "active", createdAt: "2026-07-28" }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulamos la generación de una llave real
    const fakeKey = `sk-mbro-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName || "Sin nombre",
      keyPrefix: `sk-...${fakeKey.slice(-4)}`,
      requests: 0,
      status: "active",
      createdAt: new Date().toISOString().split('T')[0]
    };

    setKeys([newKey, ...keys]);
    setGeneratedKey(fakeKey);
    setIsModalOpen(true);
    setNewKeyName("");
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: "revoked" } : k));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Generar Llave */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Generar nueva API Key</h2>
        <p className="mt-1 text-sm text-secondary">
          Usa esta llave para autenticar tus peticiones al servicio de IA.
        </p>

        <form onSubmit={handleGenerate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-wide text-muted">Nombre de la llave</label>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Ej: Proyecto de Pruebas"
              className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>
          <Button type="submit" variant="primary">
            <Plus size={16} className="mr-1" /> Generar Llave
          </Button>
        </form>
      </div>

      {/* Tabla de Llaves */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Tus API Keys</h2>
        
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-3 pr-4 font-medium">Nombre</th>
                <th className="py-3 pr-4 font-medium">Llave</th>
                <th className="py-3 pr-4 font-medium">Peticiones</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-secondary">
                    No tienes API Keys generadas.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="group">
                    <td className="py-3 pr-4 font-medium text-foreground">{key.name}</td>
                    <td className="py-3 pr-4 font-mono text-secondary">{key.keyPrefix}</td>
                    <td className="py-3 pr-4 text-secondary">{key.requests.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        key.status === "active" 
                          ? "bg-good/10 text-good border-good/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}>
                        {key.status === "active" ? "Activa" : "Revocada"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {key.status === "active" && (
                        <button 
                          onClick={() => handleRevoke(key.id)}
                          className="text-muted transition-colors hover:text-red-500"
                          title="Revocar llave"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Seguridad (Se muestra al generar) */}
      {isModalOpen && (
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
                <strong>Importante:</strong> Copia esta llave ahora mismo. Por seguridad, no podrás volver a verla una vez que cierres esta ventana.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-background p-3">
              <code className="flex-1 break-all font-mono text-sm text-foreground">{generatedKey}</code>
              <button 
                onClick={() => copyToClipboard(generatedKey)}
                className="shrink-0 rounded-md bg-accent p-2 text-white hover:opacity-90"
                title="Copiar"
              >
                <Copy size={16} />
              </button>
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