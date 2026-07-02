import { SubscriptionGateBoundary } from "@/features/subscription/components/SubscriptionGateBoundary";
import { OrgGateBoundary } from "@/features/organization/components/OrgGateBoundary";
import { useTheme } from "@/core/theme";
import { Stack } from "expo-router";

export default function OrganizationLayout() {
  const theme = useTheme();
  return (
    <SubscriptionGateBoundary>
      <OrgGateBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bg },
            animation: "slide_from_right",
          }}
        />
      </OrgGateBoundary>
    </SubscriptionGateBoundary>
  );
}
