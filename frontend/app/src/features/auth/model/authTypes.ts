export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  dateOfBirth: string | null;
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

export type PasswordResetChallengeResponse = {
  expiresInSeconds: number;
  maxAttempts: number;
};
