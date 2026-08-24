type ErrorResponse = {
  message?: string;
  remainingAttempts?: number;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  fallbackMessage?: string;
  baseUrl?: string;
};

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

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
    fallbackMessage = "The request could not be completed",
    baseUrl = apiUrl,
  }: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
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
