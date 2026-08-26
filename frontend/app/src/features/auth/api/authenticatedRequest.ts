import { ApiError, apiRequest } from "../../../shared/api/httpClient";
import type { AuthResponse } from "../model/authTypes";
import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  isAuthSessionPersistent,
  saveAuthSession,
} from "../model/authSession";

type AuthenticatedRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  fallbackMessage?: string;
};

let refreshPromise: Promise<AuthResponse> | null = null;

export async function authenticatedRequest<TResponse>(
  path: string,
  options: AuthenticatedRequestOptions = {},
): Promise<TResponse> {
  const token = getAuthToken();
  if (!token) {
    throw new ApiError("Authentication is required", 401);
  }

  try {
    return await apiRequest<TResponse>(path, { ...options, token });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }
  }

  const session = await refreshAuthSession();

  try {
    return await apiRequest<TResponse>(path, { ...options, token: session.token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearAuthSession();
    }
    throw error;
  }
}

export function refreshAuthSession(): Promise<AuthResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    return Promise.reject(new ApiError("Your session has expired", 401));
  }

  const persistent = isAuthSessionPersistent();
  refreshPromise = apiRequest<AuthResponse>("/api/auth/refresh", {
    method: "POST",
    body: { refreshToken },
    fallbackMessage: "Could not renew the session",
  })
    .then((response) => {
      saveAuthSession(response, persistent);
      return response;
    })
    .catch((error) => {
      if (error instanceof ApiError && (error.status === 400 || error.status === 401)) {
        clearAuthSession();
      }
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}
