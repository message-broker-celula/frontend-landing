import { apiRequest } from "./client";
import type {
  AuthUser,
  DatabaseListResponse,
  DatabaseCredentials,
  DatabaseUsage,
  DatabaseActionResponse,
  PublicMetrics,
  ApiKeyStatus,
  ApiKeyResponse,
  ApiUsage,
  Celula,
  CelulaListResponse,
  CelulaService,
  CelulaServiceListResponse,
  DnsStatusResponse,
  DatabaseEnginesResponse,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const API_PATHS = {
  metrics: "/metrics",
  me: "/auth/me",
  databases: "/databases",
  googleAuth: "/auth/google",
  githubAuth: "/auth/github",
  refresh: "/auth/refresh",
  celulas: "/celulas",
  ai: "/ai",
};

export function getOAuthStartUrl(provider: "google" | "github") {
  return `${BASE}${provider === "google" ? API_PATHS.googleAuth : API_PATHS.githubAuth}`;
}

// ==========================================
// Auth
// ==========================================
export const fetchCurrentUser = (token: string) =>
  apiRequest<AuthUser>(API_PATHS.me, { token });

export const refreshAuthToken = () =>
  apiRequest<{ access_token: string; token_type: string; refresh_token: string }>(
    API_PATHS.refresh,
    { method: "POST" }
  );

// ==========================================
// Databases
// ==========================================
export const fetchUserDatabases = (token: string) =>
  apiRequest<DatabaseListResponse>(API_PATHS.databases, { token });

// Actualizado: Ahora recibe el motor, versión y nombre
export const provisionDatabase = (
  token: string, 
  payload: { nombre_motor: string; version_motor: string; nombre_bd: string }
) =>
  apiRequest<DatabaseActionResponse>(API_PATHS.databases, { 
    method: "POST", 
    token, 
    body: payload 
  });

export const fetchDatabaseEngines = (token: string) =>
  apiRequest<DatabaseEnginesResponse>(`${API_PATHS.databases}/engines`, { token });

export const fetchDatabaseCredentials = (token: string, databaseId: string) =>
  apiRequest<DatabaseCredentials>(`${API_PATHS.databases}/${databaseId}/credentials`, { token });

export const fetchDatabaseUsage = (token: string, databaseId: string) =>
  apiRequest<DatabaseUsage>(`${API_PATHS.databases}/${databaseId}/usage`, { token });

export const pauseDatabase = (token: string, databaseId: string) =>
  apiRequest<DatabaseActionResponse>(`${API_PATHS.databases}/${databaseId}/pause`, { method: "POST", token });

export const resumeDatabase = (token: string, databaseId: string) =>
  apiRequest<DatabaseActionResponse>(`${API_PATHS.databases}/${databaseId}/resume`, { method: "POST", token });

// ==========================================
// Metrics
// ==========================================
export const fetchPublicMetrics = () =>
  apiRequest<PublicMetrics>(API_PATHS.metrics);

// ==========================================
// AI Gateway
// ==========================================
export const fetchApiKeyStatus = (token: string) =>
  apiRequest<ApiKeyStatus>(`${API_PATHS.ai}/api-key`, { token });

export const createApiKey = (token: string) =>
  apiRequest<ApiKeyResponse>(`${API_PATHS.ai}/api-key`, { method: "POST", token });

export const rotateApiKey = (token: string) =>
  apiRequest<ApiKeyResponse>(`${API_PATHS.ai}/api-key/rotate`, { method: "POST", token });

export const revokeApiKey = (token: string) =>
  apiRequest<{ detail: string }>(`${API_PATHS.ai}/api-key`, { method: "DELETE", token });

export const fetchApiUsage = (token: string) =>
  apiRequest<ApiUsage>(`${API_PATHS.ai}/usage`, { token });

// ==========================================
// Celulas & DNS (Subdominios)
// ==========================================
export const fetchUserCelulas = (token: string) =>
  apiRequest<CelulaListResponse>(API_PATHS.celulas, { token });

export const createCelula = (token: string, name: string) =>
  apiRequest<Celula>(API_PATHS.celulas, { method: "POST", token, body: { name } });

export const fetchCelulaServices = (token: string, celulaId: string) =>
  apiRequest<CelulaServiceListResponse>(`${API_PATHS.celulas}/${celulaId}/services`, { token });

export const createCelulaService = (token: string, celulaId: string, serviceName: string) =>
  apiRequest<CelulaService>(`${API_PATHS.celulas}/${celulaId}/services`, { 
    method: "POST", 
    token, 
    body: { service_name: serviceName, service_type: "other" } 
  });

export const fetchDnsStatus = (token: string, celulaId: string, serviceId: string) =>
  apiRequest<DnsStatusResponse>(`${API_PATHS.celulas}/${celulaId}/services/${serviceId}/dns-status`, { token });

export const deleteCelulaService = (token: string, celulaId: string, serviceId: string) =>
  apiRequest<void>(`${API_PATHS.celulas}/${celulaId}/services/${serviceId}`, { method: "DELETE", token });