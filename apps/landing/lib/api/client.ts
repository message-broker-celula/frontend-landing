import { apiUrl } from "@/lib/site-config";
import { ApiError } from "@/lib/api/errors";
import type { ApiErrorBody } from "@/lib/api/types";
import { refreshAuthToken } from "@/lib/api/endpoints";
import { clearStoredToken, setStoredToken } from "@/lib/auth/storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
  _isRetry?: boolean; // Flag para evitar loops infinitos de retry
}

function resolveUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${normalized}`;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Error ${response.status}`;

  if (response.status === 429) {
    message = "Has realizado demasiadas peticiones. Por favor, espera unos minutos antes de intentar de nuevo.";
    return new ApiError(message, response.status, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const data = (await response.json()) as ApiErrorBody;
    message = data.detail ?? message; 
  } catch {
    // Response body is not JSON
  }

  return new ApiError(message, response.status);
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;

  try {
    response = await fetch(resolveUrl(path), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
      cache: "no-store",
      credentials: "include", // <-- IMPORTANTE: Envía la cookie del refresh token
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con la API. Comprueba tu conexión e inténtalo de nuevo.",
      0,
      "NETWORK_ERROR",
    );
  }

  // 🛡️ INTERCEPTOR DE RENOVIACIÓN DE TOKEN
  // Si da 401 y no es un retry ya, intentamos refrescar el token
  if (response.status === 401 && !options._isRetry && options.token) {
    try {
      const newAuth = await refreshAuthToken();
      setStoredToken(newAuth.access_token);
      
      // Repetimos la petición original con el nuevo token
      return apiRequest<T>(path, {
        ...options,
        token: newAuth.access_token,
        _isRetry: true, // Marcamos que ya intentamos renovar
      });
    } catch (refreshError) {
      // Si el refresh falla (ej. refresh token inválido o expirado), cerramos sesión
      clearStoredToken();
      window.location.href = "/login";
      throw new ApiError("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.", 401);
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}