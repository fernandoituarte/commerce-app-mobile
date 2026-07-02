import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AUTH_ENDPOINTS } from "@/features/auth/api/endpoints";
import { AUTH_ERROR_CODES } from "@/features/auth/api/auth-error-codes";
import { logout } from "@/features/auth/store/authSlice";
import { store } from "@/core/store";
import { storage } from "@/shared/utils/storage";
import { logger } from "@/core/config/logger";
import { env } from "@/core/config/env";
import { isPublicRoute } from "./helpers";
import type { AuthTokens } from "@/features/auth/types";

// ─── Extended request config ──────────────────────────────────────

export interface AxiosRequestConfigWithRetry extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ─── Request queue ────────────────────────────────────────────────
// Requests that arrive while a refresh is in flight are parked here.
// Once the new token lands (or the refresh fails) drainQueue resolves
// or rejects all of them in one shot.

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let _isRefreshing = false;
let _queue: QueueEntry[] = [];

export const isRefreshing = (): boolean => _isRefreshing;

export const setIsRefreshing = (value: boolean): void => {
  _isRefreshing = value;
};

export const enqueueRequest = (): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    _queue.push({ resolve, reject });
  });

export const drainQueue = (error: unknown, token: string | null): void => {
  _queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  );
  _queue = [];
};

// ─── Route guards ─────────────────────────────────────────────────
// These routes must never trigger a refresh attempt to avoid loops.

const SKIP_RETRY_ROUTES = [
  AUTH_ENDPOINTS.REFRESH_TOKEN,
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
  AUTH_ENDPOINTS.VERIFY_EMAIL,
  AUTH_ENDPOINTS.RESEND_VERIFICATION,
  AUTH_ENDPOINTS.RESTORE_ACCOUNT,
];

const isSkippedRoute = (url?: string): boolean =>
  SKIP_RETRY_ROUTES.some((route) => url?.includes(route));

// Codes that require an immediate logout — no refresh attempt, no retry.
const HARD_LOGOUT_CODES = new Set<string>([
  AUTH_ERROR_CODES.SESSION_INVALIDATED,
  AUTH_ERROR_CODES.TOKEN_INVALID,
  AUTH_ERROR_CODES.TOKEN_AUDIENCE_INVALID,
  AUTH_ERROR_CODES.TOKEN_MISSING,
]);

export const isHardLogoutCode = (code: string | undefined): boolean =>
  !!code && HARD_LOGOUT_CODES.has(code);

export const shouldRetryResponseError = (error: AxiosError): boolean => {
  const config = error.config as AxiosRequestConfigWithRetry | undefined;
  const url = config?.url ?? "";
  if (!config || error.response?.status !== 401 || config._retry) return false;
  if (isSkippedRoute(url) || isPublicRoute(url, config.method)) return false;

  const code = error.response?.data?.code as string | undefined;
  // Hard-logout codes must never trigger a refresh
  if (isHardLogoutCode(code)) return false;
  // Retry only for TOKEN_EXPIRED, or for codeless 401s (backward compat with
  // older / edge backend responses that omit the code field)
  return !code || code === AUTH_ERROR_CODES.TOKEN_EXPIRED;
};

// ─── Token refresh ────────────────────────────────────────────────
// Returns the new access token on success.
// On failure clears storage, dispatches logout, and re-throws so the
// response interceptor can reject the original caller.

// Backend may return tokens nested ({ tokens: { accessToken, refreshToken } })
// or flat ({ accessToken, refreshToken }). Extract from whichever shape is present.
function extractTokens(data: unknown): AuthTokens | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  // Nested shape: { tokens: { accessToken, refreshToken } }
  if (d.tokens && typeof d.tokens === "object") {
    const t = d.tokens as Record<string, unknown>;
    if (typeof t.accessToken === "string" && typeof t.refreshToken === "string") {
      return { accessToken: t.accessToken, refreshToken: t.refreshToken };
    }
  }

  // Flat shape: { accessToken, refreshToken }
  if (typeof d.accessToken === "string" && typeof d.refreshToken === "string") {
    return { accessToken: d.accessToken, refreshToken: d.refreshToken };
  }

  return null;
}

export const refreshSession = async (): Promise<string> => {
  const refreshToken = await storage.getRefreshToken();

  if (!refreshToken) {
    logger.warn("AUTH", "No refresh token found, forcing logout");
    await storage.clearTokens();
    store.dispatch(logout());
    throw new Error("No refresh token available");
  }

  try {
    // Bare axios (not apiClient) — avoids the circular dependency with
    // client.ts and prevents this call from re-entering the 401 handler.
    const baseUrl = env.API_URL.replace(/\/$/, "");
    const { data } = await axios.post(
      `${baseUrl}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );

    const tokens = extractTokens(data);
    if (!tokens) {
      logger.error("AUTH", "Refresh response contained no recognisable token shape", data);
      throw new Error("Refresh response contained no tokens");
    }

    await storage.setTokens(tokens.accessToken, tokens.refreshToken);
    logger.log("AUTH", "Session refreshed successfully");
    return tokens.accessToken;
  } catch (error) {
    logger.error("AUTH", "Token refresh failed, forcing logout");
    await storage.clearTokens();
    store.dispatch(logout());
    throw error;
  }
};
