import { apiClient } from "../../../core/api/client";
import { SESSION_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import { storage } from "@/shared/utils/storage";
import { Session } from "../types";

// ─── Sessions Service ─────────────────────────────────────────────────
// Thin wrappers around the API client for each session endpoint.

export const sessionService = {
  async logout(): Promise<void> {
    logger.log("SESSION", "Logout request started");
    await apiClient.post(SESSION_ENDPOINTS.LOGOUT);
    storage.clearTokens();
    logger.log("SESSION", "Logout success");
  },

  async logoutAll(): Promise<void> {
    logger.log("SESSION", "Logout all request started");
    await apiClient.post(SESSION_ENDPOINTS.LOGOUT_ALL);
    storage.clearTokens();
    logger.log("SESSION", "Logout all success");
  },

  async getAllSessions(): Promise<Session[]> {
    logger.log("SESSION", "Get all sessions request started");
    const res = await apiClient.get<Session[]>(SESSION_ENDPOINTS.GET_ALL_SESSIONS);
    logger.log("SESSION", "Get all sessions success");
    return res.data;
  },

  async revokeSession(jti: string): Promise<void> {
    logger.log("SESSION", `Revoke session with jti: ${jti} started`);
    await apiClient.delete(SESSION_ENDPOINTS.REVOKE_SESSION(jti));
    logger.log("SESSION", `Revoke session with jti: ${jti} success`);
  },
};
