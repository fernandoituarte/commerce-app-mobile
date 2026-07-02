import { store } from "@/core/store";
import { storage } from "@/shared/utils/storage";
import { logger } from "@/core/config/logger";
import { AUTH_ENDPOINTS } from "@/features/auth/api/endpoints";
import type { InternalAxiosRequestConfig } from "axios";

// Public for all HTTP methods — auth flows, no Bearer token needed.
const ALWAYS_PUBLIC_ROUTES = [
  "/auth",
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
  AUTH_ENDPOINTS.VERIFY_EMAIL,
  AUTH_ENDPOINTS.RESEND_VERIFICATION,
  AUTH_ENDPOINTS.RESTORE_ACCOUNT,
];

// GET-only public — catalogue reads need no Bearer token, but still need
// X-Organization-Id so the backend can scope data to the correct org.
const GET_ONLY_PUBLIC_ROUTES = [
  "/products",
  "/categories",
  "/extras",
  "/ingredients",
  "/tags",
];

// Auth flows: no headers whatsoever — no token, no org.
const isAuthOnlyRoute = (url: string): boolean =>
  ALWAYS_PUBLIC_ROUTES.some((route) => url.startsWith(route));

// True when no Bearer token is required (auth flows OR catalogue GETs).
// Kept for backward compat with the 401 hard-logout check in client.ts, which
// correctly skips force-logout for token-free routes.
export const isPublicRoute = (url: string, method?: string): boolean => {
  if (isAuthOnlyRoute(url)) return true;
  return (
    method?.toUpperCase() === "GET" &&
    GET_ONLY_PUBLIC_ROUTES.some((route) => url.startsWith(route))
  );
};

// Exported so client.ts can gate the entire header block on auth-only routes.
export const isAlwaysPublicRoute = isAuthOnlyRoute;

export const updateHeader = async (
  request: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  const url = request.url ?? "";
  const method = request.method;

  // Auth flows: attach nothing.
  if (isAuthOnlyRoute(url)) return request;

  const { currentOrganizationId } = store.getState().organization;

  if (isPublicRoute(url, method)) {
    // Catalogue GETs: no token, but scope to org so the backend filters correctly.
    if (currentOrganizationId) {
      request.headers.set("X-Organization-Id", currentOrganizationId);
    }
    logger.log("API", `→ ${method?.toUpperCase()} ${url}`);
    return request;
  }

  // Private route: Bearer token + org header.
  const token = await storage.getAccessToken();
  if (token) {
    request.headers.set("Authorization", `Bearer ${token}`);
    if (currentOrganizationId) {
      request.headers.set("X-Organization-Id", currentOrganizationId);
    }
  }

  logger.log("API", `→ ${method?.toUpperCase()} ${url}`);
  return request;
};
