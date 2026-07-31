import { apiRequest } from "@/lib/api/client";
import { apiUrl } from "@/lib/site-config";
import type {
  AuthProvider,
  AuthUser,
  ProvisioningStatus,
  PublicMetrics,
  UserDatabase,
} from "@/lib/api/types";

export const API_PATHS = {
  metrics: "/api/metrics",
  me: "/api/me",
  database: "/api/database",
  provision: "/api/database/provision",
  databaseStatus: "/api/database/status",
  authGoogle: "/api/auth/google",
  authGithub: "/api/auth/github",
} as const;

export function getOAuthStartUrl(
  provider: AuthProvider,
  redirectUri: string,
): string {
  const path =
    provider === "google" ? API_PATHS.authGoogle : API_PATHS.authGithub;
  const url = new URL(`${apiUrl}${path}`);
  url.searchParams.set("redirect_uri", redirectUri);
  return url.toString();
}

export function fetchMetrics(signal?: AbortSignal): Promise<PublicMetrics> {
  return apiRequest<PublicMetrics>(API_PATHS.metrics, { signal });
}

export function fetchCurrentUser(
  token: string,
  signal?: AbortSignal,
): Promise<AuthUser> {
  return apiRequest<AuthUser>(API_PATHS.me, { token, signal });
}

export function fetchUserDatabase(
  token: string,
  signal?: AbortSignal,
): Promise<UserDatabase> {
  return apiRequest<UserDatabase>(API_PATHS.database, { token, signal });
}

export function provisionDatabase(
  token: string,
  signal?: AbortSignal,
): Promise<UserDatabase | ProvisioningStatus> {
  return apiRequest<UserDatabase | ProvisioningStatus>(API_PATHS.provision, {
    method: "POST",
    token,
    signal,
  });
}

export function fetchProvisioningStatus(
  token: string,
  signal?: AbortSignal,
): Promise<ProvisioningStatus> {
  return apiRequest<ProvisioningStatus>(API_PATHS.databaseStatus, {
    token,
    signal,
  });
}
