import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/auth.service";
import { storage } from "../../../shared/utils/storage";
import { useAppDispatch } from "../../../core/store/hooks";
import { setCredentials, logout } from "../store/authSlice";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  MessageResponse,
} from "../types";

// ─── useLogin ─────────────────────────────────────────────────────

export function useLogin() {
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, Error, LoginRequest>({
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

export function useRegister() {
  const dispatch = useAppDispatch();

  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: (data) => authService.register(data),
    onSuccess: async (response) => {
      await storage.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      dispatch(setCredentials({ user: response.user, tokens: response.tokens }));
    },
  });
}

// ─── useForgotPassword ───────────────────────────────────────────

export function useForgotPassword() {
  return useMutation<MessageResponse, Error, ForgotPasswordRequest>({
    mutationFn: (data) => authService.forgotPassword(data),
  });
}

// ─── useResetPassword ────────────────────────────────────────────

export function useResetPassword() {
  return useMutation<MessageResponse, Error, ResetPasswordRequest>({
    mutationFn: (data) => authService.resetPassword(data),
  });
}

// ─── useLogout ────────────────────────────────────────────────────

export function useLogout() {
  const dispatch = useAppDispatch();

  return useMutation<void, Error, void>({
    mutationFn: () => authService.logout(),
    onSettled: async () => {
      await storage.clearTokens();
      dispatch(logout());
    },
  });
}
