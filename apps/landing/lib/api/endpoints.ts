import { apiRequest } from "./client";
import type {
  AuthUser,
  DatabaseListResponse,
  DatabaseCredentials,
  DatabaseUsage,
  DatabaseActionResponse,
  PublicMetrics,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "";

export const API_PATHS = {
  metrics: "/metrics",
  me: "/auth/me",
  databases: "/databases",
  googleAuth: "/auth/google",
  githubAuth: "/auth/github",
  refresh: "/auth/refresh",
};

export function getOAuthStartUrl(provider: "google" | "github") {
  return `${BASE}${provider === "google" ? API_PATHS.googleAuth : API_PATHS.githubAuth}`;
}

// Auth
export const fetchCurrentUser = (token: string) =>
  apiRequest<AuthUser>(API_PATHS.me, { token });

// Auth Refresh
export const refreshAuthToken = () =>
  apiRequest<{ access_token: string; token_type: string; refresh_token: string }>(
    API_PATHS.refresh,
    { method: "POST" }
  );

// Databases
export const fetchUserDatabases = (token: string) =>
  apiRequest<DatabaseListResponse>(API_PATHS.databases, { token });

export const provisionDatabase = (token: string) =>
  apiRequest<DatabaseActionResponse>(API_PATHS.databases, { method: "POST", token });

export const fetchDatabaseCredentials = (token: string, databaseId: string) =>
  apiRequest<DatabaseCredentials>(`${API_PATHS.databases}/${databaseId}/credentials`, { token });

export const fetchDatabaseUsage = (token: string, databaseId: string) =>
  apiRequest<DatabaseUsage>(`${API_PATHS.databases}/${databaseId}/usage`, { token });

// Metrics
export const fetchPublicMetrics = () =>
  apiRequest<PublicMetrics>(API_PATHS.metrics);