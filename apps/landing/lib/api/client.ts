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

// FastAPI's `detail` is usually a plain string, but on a request-validation
// failure (422, e.g. a body it didn't expect at all) it's an *array* of
// {loc, msg, type} objects instead. Passing that straight into `Error`'s
// constructor silently stringifies it to the literal text "[object Object]"
// (or "[object Object],[object Object]" for more than one) via the
// language's default ToString coercion -- this normalizes it into an
// actual readable message no matter which shape comes back.
function stringifyErrorDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    const parts = detail.map((item) =>
      item && typeof item === "object" && "msg" in item ? String((item as { msg: unknown }).msg) : JSON.stringify(item),
    );
    return parts.join("; ");
  }
  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }
  return fallback;
}

async function parseError(response: Response): Promise<ApiError> {
  const fallback = `Error ${response.status}`;

  if (response.status === 429) {
    const message = "Has realizado demasiadas peticiones. Por favor, espera unos minutos antes de intentar de nuevo.";
    return new ApiError(message, response.status, "RATE_LIMIT_EXCEEDED");
  }

  let message = fallback;
  try {
    const data = (await response.json()) as ApiErrorBody;
    message = stringifyErrorDetail(data.detail, fallback);
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