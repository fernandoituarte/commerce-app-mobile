import { apiClient } from "../../../core/api/client";
import { USER_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import type {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  DeleteAccountRequest,
  UserProfileResponse,
  MessageResponse,
  ChangeEmailConfirm,
} from "../types";

// ─── User Service ─────────────────────────────────────────────────

export const userService = {
  async getProfile(): Promise<UserProfileResponse> {
    logger.log("USER", "Fetch profile started");
    const res = await apiClient.get<UserProfile>(USER_ENDPOINTS.PROFILE);
    logger.log("USER", "Fetch profile success");
    return { user: res.data };
  },

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfileResponse> {
    logger.log("USER", "Update profile started");
    const res = await apiClient.patch<UserProfile>(USER_ENDPOINTS.UPDATE_PROFILE, data);
    logger.log("USER", "Update profile success");
    return { user: res.data };
  },

  async changePassword(data: ChangePasswordRequest): Promise<MessageResponse> {
    logger.log("USER", "Change password started");
    const res = await apiClient.patch<MessageResponse>(USER_ENDPOINTS.CHANGE_PASSWORD, data);
    logger.log("USER", "Change password success");
    return res.data;
  },

  async changeEmail(data: ChangeEmailRequest): Promise<MessageResponse> {
    logger.log("USER", "Change email request started");
    const res = await apiClient.post<MessageResponse>(USER_ENDPOINTS.CHANGE_EMAIL_REQUEST, data);
    logger.log("USER", "Change email request success");
    return res.data;
  },

  async confirmChangeEmail(data: ChangeEmailConfirm): Promise<MessageResponse> {
    logger.log("USER", "Change email confirm started");
    const res = await apiClient.post<MessageResponse>(USER_ENDPOINTS.CHANGE_EMAIL_CONFIRM, data);
    logger.log("USER", "Change email confirm success");
    return res.data;
  },

  async deactivateAccount(): Promise<MessageResponse> {
    logger.log("USER", "Deactivate account started");
    const res = await apiClient.patch<MessageResponse>(USER_ENDPOINTS.DEACTIVATE_ACCOUNT);
    logger.log("USER", "Deactivate account success");
    return res.data;
  },

  async deleteAccount(data: DeleteAccountRequest): Promise<MessageResponse> {
    logger.log("USER", "Delete account started");
    const res = await apiClient.delete<MessageResponse>(USER_ENDPOINTS.DELETE_ACCOUNT, {
      data,
    });
    logger.log("USER", "Delete account success");
    return res.data;
  },
};
