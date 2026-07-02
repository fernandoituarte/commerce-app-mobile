import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/auth.service";
import { storage } from "../../../shared/utils/storage";
import { useAppDispatch } from "../../../core/store/hooks";
import { setCredentials } from "../store/authSlice";
import { env } from "../../../core/config/env";
import { logger } from "../../../core/config/logger";
import type { AuthResponse, GoogleAuthRequest } from "../types";

// ─── Lazy-load native module ──────────────────────────────────────
// @react-native-google-signin requires native code unavailable in
// Expo Go. We load it dynamically so the app doesn't crash on import.

let GoogleSignin: typeof import("@react-native-google-signin/google-signin").GoogleSignin | null = null;
let isSuccessResponse: typeof import("@react-native-google-signin/google-signin").isSuccessResponse | null = null;
let isErrorWithCode: typeof import("@react-native-google-signin/google-signin").isErrorWithCode | null = null;
let statusCodes: typeof import("@react-native-google-signin/google-signin").statusCodes | null = null;

try {
  const mod = require("@react-native-google-signin/google-signin");
  GoogleSignin = mod.GoogleSignin;
  isSuccessResponse = mod.isSuccessResponse;
  isErrorWithCode = mod.isErrorWithCode;
  statusCodes = mod.statusCodes;
} catch {
  // Native module not available (Expo Go).
  logger.warn("AUTH", "Google Sign-In native module not available (Expo Go)");
}

const isNativeAvailable = GoogleSignin !== null;

// ─── useGoogleAuth ────────────────────────────────────────────────
// Unified Google authentication hook – handles both login & register.
// Uses the native Google Sign-In SDK via @react-native-google-signin.
// The backend decides whether to create a new user or sign in.

export function useGoogleAuth(organizationId?: string) {
  const dispatch = useAppDispatch();
  const [nativeUnavailableError] = useState(
    () => (isNativeAvailable ? null : new Error("Google Sign-In requires a development build.")),
  );

  // Configure once on mount. webClientId is required to get an idToken.
  useEffect(() => {
    if (!GoogleSignin) return;
    GoogleSignin.configure({
      webClientId: env.GOOGLE_WEB_CLIENT_ID,
      ...(env.GOOGLE_IOS_CLIENT_ID && { iosClientId: env.GOOGLE_IOS_CLIENT_ID }),
    });
  }, []);

  // ── Backend mutation ──────────────────────────────────────────
  const mutation = useMutation<AuthResponse, Error, GoogleAuthRequest>({
    mutationFn: (data) => authService.googleAuth(data),
    onSuccess: async (res) => {
      await storage.setTokens(res.tokens.accessToken, res.tokens.refreshToken);
      dispatch(setCredentials({ user: res.user, tokens: res.tokens }));
    },
  });

  // ── Trigger Google sign-in ────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    if (!GoogleSignin || !isSuccessResponse || !isErrorWithCode || !statusCodes) {
      logger.warn("AUTH", "Google Sign-In unavailable, showing alert");
      Alert.alert(
        "Development Build Required",
        "Google Sign-In is not available in Expo Go. Please use a development build.",
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      logger.log("AUTH", "Google Sign-In prompt opened");
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) return;

      const idToken = response.data.idToken;
      if (idToken) {
        logger.log("AUTH", "Google idToken received, sending to backend");
        mutation.mutate({ idToken, organizationId });
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            logger.log("AUTH", "Google Sign-In cancelled by user");
            break;
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            mutation.reset();
            break;
          default:
            throw error;
        }
      } else {
        throw error;
      }
    }
  }, [mutation, organizationId]);

  return {
    signInWithGoogle,
    isLoading: mutation.isPending,
    isError: mutation.isError || !isNativeAvailable,
    error: mutation.error ?? nativeUnavailableError,
  };
}
