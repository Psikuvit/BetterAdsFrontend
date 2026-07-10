import { API_BASE_URL } from "./config";
import { ApiError, ApiErrorBody, AuthResponse } from "./types";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokens";

export const AUTH_EXPIRED_EVENT = "betterads:auth-expired";
export const RATE_LIMITED_EVENT = "betterads:rate-limited";

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach Authorization header, default true
  signal?: AbortSignal;
}

let refreshPromise: Promise<string | null> | null = null;

async function rawRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    return null;
  }

  const data: AuthResponse = await res.json();
  setTokens(data.token, data.refreshToken);
  return data.token;
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = rawRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function parseErrorBody(res: Response): Promise<ApiErrorBody> {
  try {
    const data = await res.json();
    if (data && typeof data.error === "string") {
      return data as ApiErrorBody;
    }
    return { error: `Request failed with status ${res.status}` };
  } catch {
    return { error: `Request failed with status ${res.status}` };
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth) {
      const token = getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth && path !== "/auth/refresh" && path !== "/auth/login") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch();
    } else {
      clearTokens();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
      const errBody = await parseErrorBody(res);
      throw new ApiError(res.status, errBody);
    }
  }

  if (res.status === 429 && typeof window !== "undefined") {
    window.dispatchEvent(new Event(RATE_LIMITED_EVENT));
  }

  if (!res.ok) {
    const errBody = await parseErrorBody(res);
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function buildQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
