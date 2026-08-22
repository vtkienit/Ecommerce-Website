export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: string;
};

export type AuthResponse = {
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
  newUser: boolean;
  user: AuthUser;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  name: string;
};

export type ResetTokenResponse = {
  resetToken: string;
};

type ErrorResponse = {
  message?: string;
};

const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
const tokenKey = "quydung.auth.token";
const userKey = "quydung.auth.user";

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthApiError("Cannot connect to the authentication service", 0);
  }

  if (!response.ok) {
    let message = "Authentication failed";

    try {
      const error = (await response.json()) as ErrorResponse;
      message = error.message || message;
    } catch {
      // The fallback message is used when the server does not return JSON.
    }

    throw new AuthApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const login = (request: LoginRequest) =>
  post<AuthResponse>("/api/auth/login", request);

export const register = (request: RegisterRequest) =>
  post<AuthResponse>("/api/auth/register", request);

export const authenticateWithGoogle = (credential: string) =>
  post<AuthResponse>("/api/auth/google", { credential });

export const requestPasswordReset = (email: string) =>
  post<void>("/api/auth/forgot-password", { email });

export const verifyPasswordResetCode = (email: string, code: string) =>
  post<ResetTokenResponse>("/api/auth/verify-reset-code", { email, code });

export const resetPassword = (
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
) => post<void>("/api/auth/reset-password", { resetToken, newPassword, confirmPassword });

export function saveAuthSession(response: AuthResponse, persistent: boolean) {
  clearAuthSession();

  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(tokenKey, response.token);
  storage.setItem(userKey, JSON.stringify(response.user));
}

export function clearAuthSession() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(userKey);
}

export function getAuthToken() {
  return localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey);
}

export function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(userKey) || sessionStorage.getItem(userKey);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}
