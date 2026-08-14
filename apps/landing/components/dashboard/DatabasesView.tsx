"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/lib/auth/context";
import { getErrorMessage } from "@/lib/api/errors";
import {
  fetchUserDatabases,
  fetchDatabaseEngines,
  fetchDatabaseCredentials,
  fetchDatabaseUsage,
  provisionDatabase,
  deleteDatabase,
} from "@/lib/api/endpoints";
import type {
  DatabaseInstance,
  DatabaseCredentials,
  DatabaseUsage,
  DatabaseEngine,
} from "@/lib/api/types";
import { CredentialsCard } from "@/components/dashboard/CredentialsCard";
import { StorageMonitor } from "@/components/dashboard/StorageMonitor";

// Refleja el límite fijo que hace cumplir sp_CrearBD del lado del backend
// (todos los motores combinados) -- no hay endpoint de cuota aparte, así
// que se deriva contando GET /databases.
const MAX_DATABASES = 5;

interface DatabaseDetails {
  credentials: DatabaseCredentials | null;
  usage: DatabaseUsage | null;
}

export function DatabasesView() {
  const { token, refreshSession } = useAuth();
  const [databases, setDatabases] = useState<DatabaseInstance[]>([]);
  const [details, setDetails] = useState<Record<string, DatabaseDetails>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [engines, setEngines] = useState<DatabaseEngine[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState("");
  const [selectedVersion, setSelectedVersion] = useState("");
  const [dbName, setDbName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDatabases = async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchUserDatabases(accessToken);
      const list = res.databases || [];
      setDatabases(list);

      const entries = await Promise.all(
        list.map(async (db) => {
          try {
            const [credentials, usage] = await Promise.all([
              fetchDatabaseCredentials(accessToken, db.database_id),
              fetchDatabaseUsage(accessToken, db.database_id),
            ]);
            return [db.database_id, { credentials, usage }] as const;
          } catch {
            return [db.database_id, { credentials: null, usage: null }] as const;
          }
        }),
      );
      setDetails(Object.fromEntries(entries));
    } catch (err) {
      setError(getErrorMessage(err, "No se pudieron cargar tus bases de datos."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void loadDatabases(token);
  }, [token]);

  useEffect(() => {
    const loadEngines = async () => {
      if (!token) return;
      try {
        const res = await fetchDatabaseEngines(token);
        setEngines(res.engines);
        if (res.engines.length > 0) {
          setSelectedEngine(res.engines[0].nombre_motor);
          setSelectedVersion(res.engines[0].version_motor);
        }
      } catch (err) {
        console.error("Error loading engines", err);
      }
    };
    void loadEngines();
  }, [token]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEngine || !selectedVersion) return;
    setIsCreating(true);
    setError(null);
    try {
      await provisionDatabase(token, {
        nombre_motor: selectedEngine,
        version_motor: selectedVersion,
        nombre_bd: dbName.trim(),
      });
      setDbName("");
      setShowCreateForm(false);
      await loadDatabases(token);
      await refreshSession();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo crear la base de datos."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (databaseId: string) => {
    if (!token) return;
    if (!confirm("¿Eliminar esta base de datos? Esta acción no se puede deshacer.")) return;
    setDeletingId(databaseId);
    setError(null);
    try {
      await deleteDatabase(token, databaseId);
      await loadDatabases(token);
      await refreshSession();
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo eliminar la base de datos."));
    } finally {
      setDeletingId(null);
    }
  };

  const availableVersions = engines.filter((eng) => eng.nombre_motor === selectedEngine);
  const atLimit = databases.length >= MAX_DATABASES;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-secondary">
        <Spinner /> Cargando tus bases de datos…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <Alert tone="error" title="Error">{error}</Alert> : null}

      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Tus bases de datos ({databases.length}/{MAX_DATABASES})
            </h2>
            <p className="mt-1 text-sm text-secondary">
              Elige el motor y ponle nombre a cada una. Puedes tener hasta{" "}
              {MAX_DATABASES} activas en total.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm((v) => !v)}
            disabled={atLimit}
            title={atLimit ? `Alcanzaste el límite de ${MAX_DATABASES} bases de datos` : undefined}
          >
            <Plus size={16} className="mr-1" /> Crear base de datos
          </Button>
        </div>

        {atLimit ? (
          <div className="mt-4">
            <Alert tone="warning" title="Límite alcanzado">
              Ya tienes {MAX_DATABASES} bases de datos activas. Elimina una para poder crear otra.
            </Alert>
          </div>
        ) : null}

        {showCreateForm && !atLimit ? (
          <form onSubmit={handleCreate} className="mt-5 flex flex-col gap-4 border-t border-line pt-5 text-left">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs uppercase tracking-wide text-muted">Motor</label>
                <select
                  value={selectedEngine}
                  onChange={(e) => {
                    setSelectedEngine(e.target.value);
                    const firstVersion = engines.find((eng) => eng.nombre_motor === e.target.value);
                    if (firstVersion) setSelectedVersion(firstVersion.version_motor);
                  }}
                  className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                >
                  {Array.from(new Set(engines.map((eng) => eng.nombre_motor))).map((motor) => (
                    <option key={motor} value={motor}>{motor}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-muted">Versión</label>
                <select
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                >
                  {availableVersions.map((v) => (
                    <option key={v.version_motor} value={v.version_motor}>{v.version_motor}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-muted">Nombre de la base de datos</label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="mi_proyecto"
                className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
              />
              <p className="mt-1 text-xs text-muted">
                Se ajusta automáticamente a minúsculas y guiones bajos si hace falta.
              </p>
            </div>
            <div>
              <Button type="submit" loading={isCreating} disabled={isCreating || !selectedEngine}>
                Crear
              </Button>
            </div>
          </form>
        ) : null}
      </div>

      {databases.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/30 p-8 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Database size={28} />
          </span>
          <p className="mt-4 text-secondary">Todavía no tienes bases de datos.</p>
        </div>
      ) : (
        databases.map((db) => (
          <div key={db.database_id} className="flex flex-col gap-4">
            <CredentialsCard database={db} credentials={details[db.database_id]?.credentials ?? null} />
            <StorageMonitor database={db} usage={details[db.database_id]?.usage ?? null} />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => handleDelete(db.database_id)}
                loading={deletingId === db.database_id}
                disabled={deletingId === db.database_id}
              >
                Eliminar esta base de datos
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
