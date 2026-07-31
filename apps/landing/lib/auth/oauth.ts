import type { AuthProvider } from "@/lib/api/types";
import { getOAuthStartUrl } from "@/lib/api/endpoints";

export function getAuthCallbackUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/auth/callback`;
}

export function startOAuth(provider: AuthProvider): void {
  const redirectUri = getAuthCallbackUrl();
  window.location.assign(getOAuthStartUrl(provider, redirectUri));
}
