import { apiClient } from "../../../core/api/client";
import { AUTH_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import type {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RestoreAccountRequest,
  GoogleAuthRequest,
  AuthResponse,
  MessageResponse,
} from "../types";
import { storage } from "@/shared/utils/storage";

// ─── Auth Service ─────────────────────────────────────────────────
// Thin wrappers around the API client for each auth endpoint.

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    logger.log("AUTH", "Login request started");
    const res = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);
    logger.log("AUTH", "Login success");
    return res.data;
  },

  async register(data: RegisterRequest): Promise<MessageResponse> {
    logger.log("AUTH", "Register request started");
    const res = await apiClient.post<MessageResponse>(AUTH_ENDPOINTS.REGISTER, data);
    logger.log("AUTH", "Register success — verification email sent");
    return res.data;
  },

  async verifyEmail(data: VerifyEmailRequest): Promise<MessageResponse> {
    logger.log("AUTH", "Verify email request started");
    const res = await apiClient.post<MessageResponse>(AUTH_ENDPOINTS.VERIFY_EMAIL, data);
    logger.log("AUTH", "Email verified");
    return res.data;
  },

  async resendVerification(data: ResendVerificationRequest): Promise<MessageResponse> {
    logger.log("AUTH", "Resend verification request started");
    const res = await apiClient.post<MessageResponse>(AUTH_ENDPOINTS.RESEND_VERIFICATION, data);
    logger.log("AUTH", "Verification email resent");
    return res.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    logger.log("AUTH", "Forgot password request started");
    const res = await apiClient.post<MessageResponse>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      data,
    );
    logger.log("AUTH", "Forgot password email sent");
    return res.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    logger.log("AUTH", "Reset password request started");
    const res = await apiClient.post<MessageResponse>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      data,
    );
    logger.log("AUTH", "Reset password success");
    return res.data;
  },

  async logout(): Promise<void> {
    logger.log("AUTH", "Logout request started");
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
    storage.clearTokens();
    logger.log("AUTH", "Logout success");
  },

  async logoutAll(): Promise<void> {
    logger.log("AUTH", "Logout all request started");
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT_ALL);
    storage.clearTokens();
    logger.log("AUTH", "Logout all success");
  },

  async restoreAccount(data: RestoreAccountRequest): Promise<AuthResponse> {
    logger.log("AUTH", "Restore account request started");
    const res = await apiClient.patch<AuthResponse>(AUTH_ENDPOINTS.RESTORE_ACCOUNT, data);
    logger.log("AUTH", "Restore account success");
    return res.data;
  },

  async googleAuth(data: GoogleAuthRequest): Promise<AuthResponse> {
    logger.log("AUTH", "Google auth request started");
    const res = await apiClient.post<AuthResponse>(
      AUTH_ENDPOINTS.OAUTH_GOOGLE,
      data,
    );
    logger.log("AUTH", "Google auth success");
    return res.data;
  },
};
