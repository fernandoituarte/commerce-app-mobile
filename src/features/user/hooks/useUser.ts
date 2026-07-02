import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../api/user.service";
import { storage } from "../../../shared/utils/storage";
import { useAppDispatch } from "../../../core/store/hooks";
import { setProfile, updateProfile, clearProfile } from "../store/userSlice";
import { logout } from "../../auth/store/authSlice";
import type { ApiError } from "@/shared/types/api";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  DeleteAccountRequest,
  UserProfileResponse,
  MessageResponse,
  ChangeEmailConfirm,
} from "../types";

// ─── useUserProfile ───────────────────────────────────────────────

export function useUserProfile() {
  const dispatch = useAppDispatch();

  return useQuery<UserProfileResponse, ApiError>({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await userService.getProfile();
      dispatch(setProfile(response.user));
      return response;
    },
  });
}

// ─── useUpdateProfile ─────────────────────────────────────────────

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<UserProfileResponse, ApiError, UpdateProfileRequest>({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: (response) => {
      dispatch(updateProfile(response.user));
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });
}

// ─── useChangePassword ────────────────────────────────────────────

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, ApiError, ChangePasswordRequest>({
    mutationFn: (data) => userService.changePassword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ─── useChangeEmail ───────────────────────────────────────────────

export function useChangeEmail() {
  return useMutation<MessageResponse, ApiError, ChangeEmailRequest>({
    mutationFn: (data) => userService.changeEmail(data),
  });
}

export function useConfirmEmailChange() {
  const queryClient = useQueryClient();

  return useMutation<MessageResponse, ApiError, ChangeEmailConfirm>({
    mutationFn: (data) => userService.confirmChangeEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ─── useDeactivateAccount ─────────────────────────────────────────

export function useDeactivateAccount() {
  const dispatch = useAppDispatch();

  return useMutation<MessageResponse, ApiError, void>({
    mutationFn: () => userService.deactivateAccount(),
    onSuccess: async () => {
      await storage.clearTokens();
      dispatch(clearProfile());
      dispatch(logout());
    },
  });
}

// ─── useDeleteAccount ─────────────────────────────────────────────

export function useDeleteAccount() {
  const dispatch = useAppDispatch();

  return useMutation<MessageResponse, ApiError, DeleteAccountRequest>({
    mutationFn: (data) => userService.deleteAccount(data),
    onSuccess: async () => {
      await storage.clearTokens();
      dispatch(clearProfile());
      dispatch(logout());
    },
  });
}
