import { apiRequest } from "../../../shared/api/httpClient";
import type {
  AuthResponse,
  LoginRequest,
  PasswordResetChallengeResponse,
  RegisterRequest,
  ResetTokenResponse,
} from "../model/authTypes";

export const login = (request: LoginRequest) =>
  apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: request,
    fallbackMessage: "Authentication failed",
  });

export const register = (request: RegisterRequest) =>
  apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: request,
    fallbackMessage: "Registration failed",
  });

export const authenticateWithGoogle = (credential: string) =>
  apiRequest<AuthResponse>("/api/auth/google", {
    method: "POST",
    body: { credential },
    fallbackMessage: "Google authentication failed",
  });

export const requestPasswordReset = (email: string) =>
  apiRequest<PasswordResetChallengeResponse>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
  });

export const verifyPasswordResetCode = (email: string, code: string) =>
  apiRequest<ResetTokenResponse>("/api/auth/verify-reset-code", {
    method: "POST",
    body: { email, code },
  });

export const resetPassword = (
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
) => apiRequest<void>("/api/auth/reset-password", {
  method: "POST",
  body: { resetToken, newPassword, confirmPassword },
});
