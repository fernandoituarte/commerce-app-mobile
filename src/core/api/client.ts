import axios from "axios";
import { storage } from "../../shared/utils/storage";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { ApiError } from "../../shared/types";
import { store } from "../store";
import {
  shouldRetryResponseError,
  isHardLogoutCode,
  refreshSession,
  isRefreshing,
  setIsRefreshing,
  enqueueRequest,
  drainQueue,
  type AxiosRequestConfigWithRetry,
} from "./interceptors/refresh-token";
import { isPublicRoute, isAlwaysPublicRoute } from "./interceptors/helpers";
import { logout } from "../../features/auth/store/authSlice";

// ─── Axios Instance ───────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    "x-client-type": "mobile",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ─────────────────────────────────────────
// Attach the access token to every outgoing private request.

apiClient.interceptors.request.use(
  async (config) => {
    const url = config.url ?? "";
    const method = config.method;

    if (!isAlwaysPublicRoute(url)) {
      const { currentOrganizationId } = store.getState().organization;

      if (!isPublicRoute(url, method)) {
        // Private route: needs Bearer token.
        const token = await storage.getAccessToken();
        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
      }

      // Catalogue GETs and private routes both need org scoping.
      if (currentOrganizationId) {
        config.headers.set("X-Organization-Id", currentOrganizationId);
      }
    }

    if (config.data instanceof FormData) {
      config.headers.delete("Content-Type");
    }

    logger.log("API", `${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error("API", "Request interceptor error", error);
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ─────────────────────────────────────────
// On 401: attempt a one-shot token refresh, then replay the original
// request. Concurrent requests that arrive during the refresh are
// queued and replayed with the new token once it settles.
// All other errors are normalised to the ApiError shape.

apiClient.interceptors.response.use(
  (response) => {
    logger.log(
      "API",
      `${response.config.method?.toUpperCase()} ${response.config.url} ${response.status}`,
    );
    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    // ── 401 → token refresh ───────────────────────────────────────
    if (shouldRetryResponseError(error)) {
      if (isRefreshing()) {
        // Another refresh is already in flight — park this request and
        // replay it once the new token lands.
        const newToken = await enqueueRequest();
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }

      originalRequest._retry = true;
      setIsRefreshing(true);

      try {
        const newToken = await refreshSession();
        drainQueue(null, newToken);
        originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(originalRequest);
      } catch (refreshError) {
        drainQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        setIsRefreshing(false);
      }
    }

    // ── Hard-logout 401s (session gone / token invalid / missing) ─
    // shouldRetryResponseError already returned false for these codes.
    // Clear local session state so the auth guard can redirect to login.
    const responseCode = error.response?.data?.code as string | undefined;
    if (
      error.response?.status === 401 &&
      !isPublicRoute(originalRequest?.url ?? "", originalRequest?.method) &&
      isHardLogoutCode(responseCode)
    ) {
      logger.warn("AUTH", `Forced logout, clearing session (${responseCode})`);
      await storage.clearTokens();
      store.dispatch(logout());
    }

    // ── Normalise all other errors ────────────────────────────────
    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        "An unexpected error occurred",
      statusCode: error.response?.status ?? 500,
      code: error.response?.data?.code,
      errors: error.response?.data?.errors,
    };

    logger.error(
      "API",
      `${error.config?.method?.toUpperCase()} ${error.config?.url} ${apiError.statusCode}`,
      apiError.message,
    );

    return Promise.reject(apiError);
  },
);
