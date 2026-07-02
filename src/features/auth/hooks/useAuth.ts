import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/auth.service";
import { storage } from "../../../shared/utils/storage";
import { useAppDispatch } from "../../../core/store/hooks";
import { setCredentials, logout } from "../store/authSlice";
import type { ApiError } from "@/shared/types/api";
import type {
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RestoreAccountRequest,
  AuthResponse,
  MessageResponse,
} from "../types";

// ─── useLogin ─────────────────────────────────────────────────────

export function useLogin() {
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, ApiError, LoginRequest>({
    mutationFn: (data) => authService.login(data),
    onSuccess: async (response) => {
      await storage.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      dispatch(setCredentials({ user: response.user, tokens: response.tokens }));
    },
  });
}

// ─── useRegister ──────────────────────────────────────────────────
// Registration sends a verification email — no tokens returned.
// Navigation to verify-email is handled in the screen's per-call onSuccess.

export function useRegister() {
  return useMutation<MessageResponse, ApiError, RegisterRequest>({
    mutationFn: (data) => authService.register(data),
  });
}

// ─── useVerifyEmail ───────────────────────────────────────────────

export function useVerifyEmail() {
  return useMutation<MessageResponse, ApiError, VerifyEmailRequest>({
    mutationFn: (data) => authService.verifyEmail(data),
  });
}

// ─── useResendVerification ────────────────────────────────────────

export function useResendVerification() {
  return useMutation<MessageResponse, ApiError, ResendVerificationRequest>({
    mutationFn: (data) => authService.resendVerification(data),
  });
}

// ─── useForgotPassword ───────────────────────────────────────────

export function useForgotPassword() {
  return useMutation<MessageResponse, ApiError, ForgotPasswordRequest>({
    mutationFn: (data) => authService.forgotPassword(data),
  });
}

// ─── useResetPassword ────────────────────────────────────────────

export function useResetPassword() {
  return useMutation<MessageResponse, ApiError, ResetPasswordRequest>({
    mutationFn: (data) => authService.resetPassword(data),
  });
}

// ─── useRestoreAccount ───────────────────────────────────────────

export function useRestoreAccount() {
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, ApiError, RestoreAccountRequest>({
    mutationFn: (data) => authService.restoreAccount(data),
    onSuccess: async (response) => {
      await storage.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      dispatch(setCredentials({ user: response.user, tokens: response.tokens }));
    },
  });
}



