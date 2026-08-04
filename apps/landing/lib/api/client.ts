import { apiUrl } from "@/lib/site-config";
import { ApiError } from "@/lib/api/errors";
import type { ApiErrorBody } from "@/lib/api/types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
}

function resolveUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${normalized}`;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Error ${response.status}`;

  // 🛡️ Manejo específico para Rate Limiting (429)
  if (response.status === 429) {
    message = "Has realizado demasiadas peticiones. Por favor, espera unos minutos antes de intentar de nuevo.";
    return new ApiError(message, response.status, "RATE_LIMIT_EXCEEDED");
  }

  try {
    const data = (await response.json()) as ApiErrorBody;
    // El backend devuelve { "detail": "mensaje" }
    message = data.detail ?? message; 
  } catch {
    // Response body is not JSON; keep the status-based message.
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
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con la API. Comprueba tu conexión e inténtalo de nuevo.",
      0,
      "NETWORK_ERROR",
    );
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}