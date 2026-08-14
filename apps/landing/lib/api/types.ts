/** Shared API contracts expected from the cell backend. */

export type AuthProvider = "google" | "github";

export type DatabaseStatus =
  | "provisioning"
  | "active"
  | "paused"
  | "deleted"
  | "unknown"
  | "error";

export interface PublicMetrics {
  totalUsers: number;
  totalDatabases: number;
  activeDatabases: number;
  totalLogins: number;
  activeUsers: number;
  availability: number;
}

export interface AuthUser {
  subject: string;
  role: string | null;
  permissions: string[];
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface DatabaseInstance {
  database_id: string;
  name: string | null;
  status: DatabaseStatus;
  engine: string | null;        // <--- NUEVO
  host: string | null;
  port: number | null;
  last_activity: string | null; // <--- NUEVO
  created_at: string | null;
  ttl_expires_at: string | null;
  storage_limit_mb: number | null;
  storage_used_mb: number | null;
}

export interface DatabaseListResponse {
  databases: DatabaseInstance[];
}

export interface DatabaseCredentials {
  host: string | null;
  port: number | null;
  database_name: string | null;
  username: string | null;
  password: string | null;
  connection_string?: string | null;
}

export interface DatabaseUsage {
  database_id: string;
  storage_limit_mb: number | null;
  storage_used_mb: number | null;
  storage_percentage: number | null;
  active_connections: number | null;
  max_connections: number | null;
}

export interface DatabaseActionResponse {
  database_id: string;
  status: string;
  detail: string;
}

export interface ApiErrorBody {
  detail: string;
}