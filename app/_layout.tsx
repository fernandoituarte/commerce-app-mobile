import { useEffect, useState } from "react";
import { useColorScheme, View, Text, ActivityIndicator } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider, useTranslation } from "react-i18next";
import "@/core/config/env"; // Validate env vars at startup – throws on misconfiguration
import i18n from "@/i18n";
import { getStoredLanguage } from "@/i18n/config";
import { AppProviders } from "@/core/providers/AppProviders";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { spacing, useTheme } from "@/core/theme";
import { organizationService } from "@/features/organization/api/organization.service";
import { setCurrentOrganizationId } from "@/features/organization/store/organizationSlice";
import { logger } from "@/core/config/logger";
import { storage } from "@/shared/utils/storage";

if (__DEV__) {
  require("../src/core/config/ReactotronConfig");
}

// ─── Auth Guard ───────────────────────────────────────────────────

function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, isLoading, segments]);
}

// ─── Inner Layout ─────────────────────────────────────────────────
// Owns the org bootstrap for ALL authenticated route groups.
// The bootstrap runs exactly once per authentication cycle:
//   cold launch  → waits for initializeApp's profile fetch to finish
//                  (profileLoadAttempted=true), then resolves once with
//                  the user id in hand.
//   fresh login  → auth.user is populated by setCredentials immediately,
//                  so readyToBootstrap is true right away.
//   profile fail → initializeApp still sets profileLoadAttempted=true in
//                  finally, so the bootstrap runs once and falls back to
//                  the first org (no permanent spinner).
//   hard logout  → 401 interceptor dispatches logout() → isAuthenticated
//                  becomes false → bootstrap exits cleanly.

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();

  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAppSelector(
    (s) => s.auth,
  );
  const { profile, profileLoadAttempted } = useAppSelector((s) => s.user);

  // userId from either source:
  //  • cold launch  → user.profile.id (set by initializeApp profile fetch)
  //  • fresh login  → auth.user.id    (set by setCredentials)
  const userId = profile?.id ?? authUser?.id ?? null;

  // readyToBootstrap = true when we have enough information to resolve the org:
  //  • profileLoadAttempted: initializeApp finished its one-shot profile
  //    fetch (success or fail) — the org bootstrap can proceed.
  //  • !!authUser: fresh login — setCredentials populated auth.user
  //    synchronously, no need to wait for initializeApp.
  const readyToBootstrap = profileLoadAttempted || !!authUser;

  const [isOrgResolved, setIsOrgResolved] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  useProtectedRoute();

  useEffect(() => {
    logger.log(
      "BOOTSTRAP",
      `Effect — authLoading:${authLoading} isAuthenticated:${isAuthenticated} ` +
        `readyToBootstrap:${readyToBootstrap} userId:${userId ?? "null"}`,
    );

    if (authLoading) {
      logger.log("BOOTSTRAP", "Waiting — auth still loading");
      return;
    }

    if (!isAuthenticated) {
      logger.log("BOOTSTRAP", "Not authenticated — clearing org state");
      dispatch(setCurrentOrganizationId(null));
      setIsOrgResolved(true);
      return;
    }

    if (!readyToBootstrap) {
      // Authenticated but initializeApp hasn't finished fetching the
      // profile yet. Keep the spinner and wait — the effect re-runs
      // when readyToBootstrap flips to true.
      logger.log("BOOTSTRAP", "Authenticated — waiting for profile fetch to complete");
      return;
    }

    // At this point we run resolveOrg exactly once per auth cycle.
    setIsOrgResolved(false);
    let cancelled = false;

    const resolveOrg = async () => {
      try {
        logger.log("BOOTSTRAP", `Fetching memberships (userId:${userId ?? "none"})…`);
        const memberships = await organizationService.getOrganizationsByUserId();
        if (cancelled) return;

        logger.log(
          "BOOTSTRAP",
          `Memberships received (${memberships?.length ?? 0}):`,
          memberships,
        );

        const validIds = new Set(memberships?.map((m) => m.organization.id) ?? []);

        let stored: string | null = null;
        if (userId) {
          stored = await storage.getCurrentOrganizationId(userId);
          if (cancelled) return;
          logger.log("BOOTSTRAP", `Stored org for user ${userId}: ${stored ?? "none"}`);
        } else {
          logger.warn(
            "BOOTSTRAP",
            "No userId available (profile fetch failed) — skipping storage restore",
          );
        }

        if (stored && validIds.has(stored)) {
          logger.log("BOOTSTRAP", `Restoring stored org: ${stored}`);
          dispatch(setCurrentOrganizationId(stored));
        } else {
          const firstId = memberships?.[0]?.organization?.id;
          if (stored) {
            logger.log(
              "BOOTSTRAP",
              `Stored org ${stored} not in memberships — falling back to first: ${firstId ?? "none"}`,
            );
          } else {
            logger.log(
              "BOOTSTRAP",
              `No stored org — selecting first: ${firstId ?? "none"}`,
            );
          }
          if (firstId) {
            dispatch(setCurrentOrganizationId(firstId));
            if (userId) {
              await storage.setOrganizationId(userId, firstId);
            }
          } else {
            logger.warn("BOOTSTRAP", "User has no organization memberships");
          }
        }
      } catch (err: unknown) {
        const e = err as { message?: string; statusCode?: number } | null;
        logger.error(
          "BOOTSTRAP",
          `resolveOrg failed — status:${e?.statusCode ?? "?"} message:${e?.message ?? String(err)}`,
        );
      } finally {
        if (!cancelled) {
          setIsOrgResolved(true);
        }
      }
    };

    resolveOrg();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, readyToBootstrap, dispatch]);

  if (isAuthenticated && !authLoading && !isOrgResolved) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.bg,
          gap: spacing.sm,
        }}
      >
        <ActivityIndicator color={theme.primary} />
        <Text style={{ color: theme.textMuted, fontSize: 14 }}>
          {t("org.bootstrap.loading")}
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Slot />
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────

export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    getStoredLanguage().then((lng) => {
      i18n.changeLanguage(lng).then(() => setI18nReady(true));
    });
  }, []);

  if (!i18nReady) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <AppProviders>
        <RootLayoutNav />
      </AppProviders>
    </I18nextProvider>
  );
}
