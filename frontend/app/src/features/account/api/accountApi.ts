import { ApiError, apiRequest } from "../../../shared/api/httpClient";
import { getAuthToken } from "../../auth/model/authSession";
import type { AuthUser } from "../../auth/model/authTypes";
import type { ProfileUpdateRequest } from "../model/accountTypes";

const authenticatedRequest = <TResponse>(
  path: string,
  method: "GET" | "PATCH" = "GET",
  body?: unknown,
) => {
  const token = getAuthToken();

  if (!token) {
    throw new ApiError("Authentication is required", 401);
  }

  return apiRequest<TResponse>(path, { method, body, token });
};

export const getCurrentProfile = () =>
  authenticatedRequest<AuthUser>("/api/users/me");

export const updateProfile = (request: ProfileUpdateRequest) =>
  authenticatedRequest<AuthUser>("/api/users/me", "PATCH", request);

export const updateAddress = (address: string) =>
  authenticatedRequest<AuthUser>("/api/users/me/address", "PATCH", { address });
