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
  engine: string | null;        
  host: string | null;
  port: number | null;
  last_activity: string | null; 
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

// ==========================================
// AI Gateway Types
// ==========================================

export interface ApiKeyStatus {
  client_id: number;
  key_prefix: string;
  status: string;
  can_call_api: boolean;
  limits: {
    requests_per_minute: number;
    daily_token_limit: number;
    monthly_token_limit: number;
  };
  last_used_at: string | null;
}

export interface ApiKeyResponse {
  client_id: number;
  api_key: string; // Solo se devuelve al crear/rotar
  key_prefix: string;
  base_url: string;
}

export interface ApiUsage {
  total_requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// ==========================================
// Celulas & DNS Types (Para el DnsView)
// ==========================================

export interface Celula {
  celula_id: string;
  name: string;
  domain: string | null;
  owner_subject: string | null;
}

export interface CelulaListResponse {
  celulas: Celula[];
}

export interface CelulaService {
  service_id: string;
  celula_id: string;
  service_name: string;
  service_type: "frontend" | "api" | "auth" | "payments" | "other";
  domain: string | null;
  database_id: string | null;
}

export interface CelulaServiceListResponse {
  services: CelulaService[];
}

export interface DnsStatusResponse {
  fqdn: string;
  propagated: boolean;
}