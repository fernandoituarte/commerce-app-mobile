// ─── User Feature Types ───────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  emailVerified: boolean;
  googleId?: string | null;
  provider?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// ─── Request Types ────────────────────────────────────────────────

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  password: string;
}

export interface ChangeEmailConfirm {
  code: string;
}

export interface DeactivateAccountRequest {}

export interface DeleteAccountRequest {
  password: string;
  confirmation: string; // e.g. "DELETE"
}

// ─── Response Types ───────────────────────────────────────────────

export interface UserProfileResponse {
  user: UserProfile;
}

export interface MessageResponse {
  message: string;
}
