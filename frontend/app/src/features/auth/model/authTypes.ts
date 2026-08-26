export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  addressLine: string | null;
  provinceCode: number | null;
  provinceName: string | null;
  wardCode: number | null;
  wardName: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth: string | null;
  role: string;
};

export type AuthResponse = {
  token: string;
  tokenType: "Bearer";
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
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

export type PasswordResetChallengeResponse = {
  expiresInSeconds: number;
  maxAttempts: number;
};
