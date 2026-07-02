import React from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useSegments } from "expo-router";
import { useTheme } from "@/core/theme";
import { useHasOrganization } from "../hooks/useHasOrganization";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import { OrgSetupBlockedScreen } from "./OrgSetupBlockedScreen";

interface Props {
  children: React.ReactNode;
}

export function OrgGateBoundary({ children }: Props) {
  const { hasOrganization, isLoading } = useHasOrganization();
  const { level } = useSubscriptionAccess(); // cached — no extra network request
  const segments = useSegments();
  const theme = useTheme();

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.bg,
        }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (!hasOrganization) {
    // readonly (PAST_DUE / PAUSED) + no org: backend PaidOnboardingGuard
    // requires ACTIVE status for POST /organization. Showing the create form
    // would lead to a 403. Show an explanatory screen instead.
    if (level === "readonly") {
      return <OrgSetupBlockedScreen />;
    }

    // full (ACTIVE / TRIAL) + no org: redirect to the create screen.
    // Guard against the redirect loop by exempting the /create route itself.
    const isOnCreateRoute = segments.includes("create");
    if (!isOnCreateRoute) {
      return <Redirect href="/(organization)/create" />;
    }
    // isOnCreateRoute === true → fall through and render children so the
    // create screen can mount and the user can submit the form.
  }

  return <>{children}</>;
}
