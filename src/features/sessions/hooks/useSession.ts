import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "../api/session.service";
import { storage } from "../../../shared/utils/storage";
import { useAppDispatch } from "../../../core/store/hooks";
import { logout } from "@/features/auth/store/authSlice";
import type { Session } from "../types";

// ─── useLogout ────────────────────────────────────────────────────

export function useLogout() {
  const dispatch = useAppDispatch();

  return useMutation<void, Error, void>({
    mutationFn: () => sessionService.logout(),
    onSettled: async () => {
      await storage.clearTokens();
      dispatch(logout());
    },
  });
}

// ─── useLogoutAll ─────────────────────────────────────────────────

export function useLogoutAll() {
  const dispatch = useAppDispatch();

  return useMutation<void, Error, void>({
    mutationFn: () => sessionService.logoutAll(),
    onSettled: async () => {
      await storage.clearTokens();
      dispatch(logout());
    },
  });
}

// ─── useRevokeSession ─────────────────────────────────────────────
// Receives the jti via mutate(jti) so the same hook instance can be
// reused for every row in the sessions list.

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (jti) => sessionService.revokeSession(jti),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// ─── useGetAllSessions ────────────────────────────────────────────

export function useGetAllSessions() {
  return useQuery<Session[], Error, Session[]>({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getAllSessions(),
  });
}
