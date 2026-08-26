import { authenticatedRequest } from "../../auth/api/authenticatedRequest";
import type { AuthUser } from "../../auth/model/authTypes";
import type { VietnameseAddress } from "../../address/model/addressTypes";
import type { ProfileUpdateRequest } from "../model/accountTypes";

const accountRequest = <TResponse>(
  path: string,
  method: "GET" | "PATCH" = "GET",
  body?: unknown,
) => authenticatedRequest<TResponse>(path, { method, body });

export const getCurrentProfile = () =>
  accountRequest<AuthUser>("/api/users/me");

export const updateProfile = (request: ProfileUpdateRequest) =>
  accountRequest<AuthUser>("/api/users/me", "PATCH", request);

export const updateAddress = (address: VietnameseAddress) =>
  accountRequest<AuthUser>("/api/users/me/address", "PATCH", address);
