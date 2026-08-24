export type ProfileUpdateRequest = {
  name: string;
  phone: string;
  gender: "" | "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string | null;
};
