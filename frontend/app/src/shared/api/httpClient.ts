type ErrorResponse = {
  message?: string;
  remainingAttempts?: number;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
  fallbackMessage?: string;
};

export const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
export const apiWebSocketUrl = apiUrl.replace(/^http/, "ws");

export class ApiError extends Error {
  status: number;
  remainingAttempts?: number;

  constructor(message: string, status: number, remainingAttempts?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.remainingAttempts = remainingAttempts;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  {
    method = "GET",
    body,
    token,
    signal,
    fallbackMessage = "The request could not be completed",
  }: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;
  const formBody = body instanceof FormData;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body === undefined || formBody ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined
        ? undefined
        : formBody
          ? body
          : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("Cannot connect to the server", 0);
  }

  if (!response.ok) {
    let message = fallbackMessage;
    let remainingAttempts: number | undefined;

    try {
      const error = (await response.json()) as ErrorResponse;
      message = error.message || message;
      remainingAttempts = typeof error.remainingAttempts === "number"
        ? error.remainingAttempts
        : undefined;
    } catch {
      // Use the fallback when the server does not return JSON.
    }

    throw new ApiError(message, response.status, remainingAttempts);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
