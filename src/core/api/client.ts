import axios from "axios";
import { storage } from "../../shared/utils/storage";
import { env } from "../env";
import type { ApiError } from "../../shared/types";

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
// Attach the access token to every outgoing request.

apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────
// Normalise error shapes so consumers always get a consistent ApiError.

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message:
          error.response?.data?.message ??
          error.message ??
          "An unexpected error occurred",
        statusCode: error.response?.status ?? 500,
        errors: error.response?.data?.errors,
      };
      return Promise.reject(apiError);
    }
    return Promise.reject(error);
  },
);
