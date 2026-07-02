import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/core/theme";
import { useSubscriptionAccess } from "../hooks/useSubscriptionAccess";
import { SubscriptionGateScreen } from "./SubscriptionGateScreen";
import { SubscriptionProcessingScreen } from "./SubscriptionProcessingScreen";
import { ReadOnlyBanner } from "@/shared/components/ui/ReadOnlyBanner";

interface Props {
  children: React.ReactNode;
}

export function SubscriptionGateBoundary({ children }: Props) {
  const { level, isLoading, isFetching, refetch } = useSubscriptionAccess();
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

  if (level === "blocked") {
    return <SubscriptionGateScreen refetch={refetch} isFetching={isFetching} />;
  }

  if (level === "processing") {
    return (
      <SubscriptionProcessingScreen refetch={refetch} isFetching={isFetching} />
    );
  }

  // "readonly" or "full" — render app shell with optional bottom banner
  return (
    <View style={{ flex: 1 }}>
      {children}
      {level === "readonly" && <ReadOnlyBanner />}
    </View>
  );
}
