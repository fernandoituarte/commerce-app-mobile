import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { logger } from "../../core/config/logger";

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  THEME_MODE: "theme_mode",
} as const;

export const storage = {
  // ─── Secure Token Management (expo-secure-store) ────────────────

  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
    logger.log("STORAGE", "Tokens saved to secure storage");
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
    logger.log("STORAGE", "Tokens cleared from secure storage");
  },

  // ─── Organization (AsyncStorage) ─────────────────────────────────────

  async getCurrentOrganizationId(userId: string): Promise<string | null> {
    return AsyncStorage.getItem(`user:${userId}:current_org`);
  },

  async setOrganizationId(
    userId: string,
    organizationId: string,
  ): Promise<void> {
    await AsyncStorage.setItem(`user:${userId}:current_org`, organizationId);
  },

  // ─── Theme (AsyncStorage) ────────────────────────────────────────

  async getThemeMode(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.THEME_MODE);
  },

  async setThemeMode(mode: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.THEME_MODE, mode);
  },

  // ─── Generic Storage (AsyncStorage – non-critical data) ─────────

  async get<T>(key: string): Promise<T | null> {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  async set(key: string, value: unknown): Promise<void> {
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
