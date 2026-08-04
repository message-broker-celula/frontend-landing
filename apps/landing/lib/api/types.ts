/** Shared API contracts expected from the cell backend. */
// Basado estrictamente en la documentación de endpoints del backend

export type AuthProvider = "google" | "github";

export type DatabaseStatus =
  | "provisioning" // Estado de carga del frontend
  | "active"
  | "paused"
  | "deleted"
  | "unknown" // El backend usa 'unknown'
  | "error"; // Estado de error del frontend

export interface PublicMetrics {
  totalUsers: number;
  totalDatabases: number;
  activeDatabases: number;
  totalLogins: number;
  activeUsers: number;
  availability: number;
}

// Respuesta de GET /auth/me
export interface AuthUser {
  subject: string;
  role: string | null;
  permissions: string[];
  // El backend podría no devolver estos datos directamente en /me, 
  // pero los dejamos opcionales por si vienen en el JWT
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

// Item de la respuesta de GET /databases
export interface DatabaseInstance {
  database_id: string;
  name: string | null;
  status: DatabaseStatus;
  created_at: string | null;
  ttl_expires_at: string | null;
  storage_limit_mb: number | null;
  storage_used_mb: number | null;
}

// Respuesta de GET /databases
export interface DatabaseListResponse {
  databases: DatabaseInstance[];
}

// Respuesta de GET /databases/{id}/credentials
export interface DatabaseCredentials {
  host: string | null;
  port: number | null;
  database_name: string | null;
  username: string | null;
  password: string | null;
  connection_string?: string | null;
}

// Respuesta de GET /databases/{id}/usage
export interface DatabaseUsage {
  database_id: string;
  storage_limit_mb: number | null;
  storage_used_mb: number | null;
  storage_percentage: number | null;
  active_connections: number | null;
  max_connections: number | null;
}

// Respuesta de POST /databases
export interface DatabaseActionResponse {
  database_id: string;
  status: string;
  detail: string;
}

export interface ApiErrorBody {
  detail: string; // Formato estándar de error del backend: {"detail": "mensaje"}
}