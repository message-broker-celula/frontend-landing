"use client";

import { useState } from "react";
import { Globe, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// Tipos temporales para la UI
type DnsRecord = {
  id: string;
  subdomain: string;
  type: "A" | "CNAME";
  value: string;
  status: "Propagando" | "Activo";
};

export function DnsView() {
  const [records, setRecords] = useState<DnsRecord[]>([
    // Dato de ejemplo inicial
    { id: "1", subdomain: "miapp", type: "A", value: "190.143.35.83", status: "Activo" }
  ]);
  
  const [subdomain, setSubdomain] = useState("");
  const [type, setType] = useState<"A" | "CNAME">("A");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subdomain || !value) {
      setError("Debes completar todos los campos.");
      return;
    }

    // Validación básica de formato
    if (type === "A" && !/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
      setError("Para un registro tipo A, el valor debe ser una IPv4 válida.");
      return;
    }

    const newRecord: DnsRecord = {
      id: Date.now().toString(),
      subdomain: subdomain.toLowerCase(),
      type,
      value,
      status: "Propagando" // Simulamos que tarda en propagar
    };

    setRecords([newRecord, ...records]);
    setSubdomain("");
    setValue("");

    // Simulamos que en 3 segundos se activa
    setTimeout(() => {
      setRecords(prev => prev.map(r => r.id === newRecord.id ? { ...r, status: "Activo" } : r));
    }, 3000);
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Formulario de Creación */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight">Crear nuevo subdominio</h2>
        <p className="mt-1 text-sm text-secondary">
          Apunta tu aplicación o servicio a un subdominio personalizado.
        </p>

        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-muted">Nombre del subdominio</label>
              <div className="mt-1 flex items-center rounded-lg border border-line bg-background px-3">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="miapp"
                  className="w-full bg-transparent py-2 text-sm text-foreground outline-none"
                />
                <span className="text-sm text-muted">.mbro.coderhivex.com</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-wide text-muted">Tipo de registro</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "A" | "CNAME")}
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="A">A (IPv4)</option>
                <option value="CNAME">CNAME (Alias)</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-muted">Valor (IP o URL)</label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="190.143.35.83"
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
          </div>

          {error && <Alert tone="error" title="Error de validación">{error}</Alert>}

          <div>
            <Button type="submit" variant="primary">
              <Plus size={16} className="mr-1" /> Crear Registro DNS
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
                <th className="py-3 pr-4 font-medium">Tipo</th>
                <th className="py-3 pr-4 font-medium">Valor</th>
                <th className="py-3 pr-4 font-medium">Estado</th>
                <th className="py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-secondary">
                    No tienes dominios creados todavía.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id} className="group">
                    <td className="py-3 pr-4 font-mono text-foreground">
                      {rec.subdomain}.mbro.coderhivex.com
                    </td>
                    <td className="py-3 pr-4 text-secondary">{rec.type}</td>
                    <td className="py-3 pr-4 font-mono text-secondary">{rec.value}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        rec.status === "Activo" 
                          ? "bg-good/10 text-good border-good/20" 
                          : "bg-accent-soft text-accent border-accent/20 animate-pulse"
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleDelete(rec.id)}
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

    </div>
  );
}