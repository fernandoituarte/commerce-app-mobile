import { useTheme } from "@/core/theme";
import { SubscriptionGateBoundary } from "@/features/subscription/components/SubscriptionGateBoundary";
import { Stack } from "expo-router";

export default function AppLayout() {
  const theme = useTheme();
  return (
    <SubscriptionGateBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      />
    </SubscriptionGateBoundary>
  );
}
