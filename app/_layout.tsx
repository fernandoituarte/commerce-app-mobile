import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";
import "@/core/env"; // Validate env vars at startup – throws on misconfiguration
import i18n from "@/i18n";
import { getStoredLanguage } from "@/i18n/config";
import { AppProviders } from "@/core/providers/AppProviders";
import { useAppSelector } from "@/core/store/hooks";

// ─── Auth Guard ───────────────────────────────────────────────────
// Redirects users based on authentication state.
// Runs reactively whenever isAuthenticated changes (login / logout).

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
// Must be rendered inside providers so hooks (Redux, etc.) work.

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  useProtectedRoute();

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
