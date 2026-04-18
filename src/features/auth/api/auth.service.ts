import { apiClient } from "../../../core/api/client";
import { AUTH_ENDPOINTS } from "./endpoints";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  GoogleAuthRequest,
  AuthResponse,
  MessageResponse,
} from "../types";

// ─── Auth Service ─────────────────────────────────────────────────
// Thin wrappers around the API client for each auth endpoint.

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
    return res.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD, data);
    return res.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<MessageResponse> {
    const res = await apiClient.post<MessageResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
    return res.data;
  },

  async logout(): Promise<void> {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  async googleAuth(data: GoogleAuthRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.OAUTH_GOOGLE, data);
    return res.data;
  },
};
