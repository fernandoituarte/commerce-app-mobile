import React from "react";
import { Alert, View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  EmptyState,
  ScreenContainer,
  ScreenHeader,
  Skeleton,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import {
  useCreateSubscriptionSession,
  usePlans,
} from "@/features/subscription/hooks/useSubscription";
import type { Plan } from "@/features/subscription/types";

// Number of i18n feature strings per plan (marketing copy, not billing data).
const PLAN_FEATURE_COUNT: Record<string, number> = {
  BASIC: 3,
  PRO:   5,
};

function formatPrice(plan: Plan, currencySymbol: string): string {
  if (plan.amount === null) return "—";
  return `${currencySymbol}${plan.amount / 100}`;
}

export default function SubscriptionCreateScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const {
    data: plans = [],
    isLoading: plansLoading,
    isError: plansError,
    refetch,
  } = usePlans();

  const { mutateAsync: createSession, isPending } = useCreateSubscriptionSession();

  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("PRO");

  const selectedPlan = plans.find((p) => p.plan === selectedPlanId);

  const handleSubmit = async () => {
    if (!selectedPlan) return;
    try {
      await createSession({ priceId: selectedPlan.priceId, provider: "stripe" });
      router.replace("/(account)/subscription/current");
    } catch {
      Alert.alert(
        t("account.subscriptionCreate.errorTitle"),
        t("account.subscriptionCreate.errorDescription"),
      );
    }
  };

  const intervalKey = (interval: Plan["interval"]) =>
    interval === "year"
      ? "account.subscriptionCreate.perYear"
      : "account.subscriptionCreate.perMonth";

  // ─── Loading state ────────────────────────────────────────────────

  if (plansLoading) {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionCreate.title")} />
        <View style={{ gap: spacing.md }}>
          <Skeleton height={200} style={{ borderRadius: radius.xl }} />
          <Skeleton height={200} style={{ borderRadius: radius.xl }} />
        </View>
      </ScreenContainer>
    );
  }

  // ─── Error / empty state ──────────────────────────────────────────

  if (plansError || plans.length === 0) {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionCreate.title")} />
        <EmptyState
          icon="alert-circle-outline"
          title={t("account.subscriptionCreate.plansErrorTitle")}
          description={t("account.subscriptionCreate.plansErrorDescription")}
          actionLabel={t("account.subscriptionCreate.retry")}
          onAction={() => refetch()}
        />
      </ScreenContainer>
    );
  }

  // ─── Plan cards ───────────────────────────────────────────────────

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t("account.subscriptionCreate.title")} />

      <Text
        style={[
          typography.body,
          { color: theme.textMuted, marginBottom: spacing.lg },
        ]}
      >
        {t("account.subscriptionCreate.subtitle")}
      </Text>

      <View style={styles.list}>
        {plans.map((plan) => {
          const planKey = plan.plan.toLowerCase(); // "PRO" -> "pro"
          const active = selectedPlanId === plan.plan;
          const featureCount = PLAN_FEATURE_COUNT[plan.plan] ?? 0;
          const currencySymbol = t(`currency.${plan.currency}`);

          return (
            <Pressable
              key={plan.plan}
              onPress={() => setSelectedPlanId(plan.plan)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: active ? theme.primary : theme.border,
                  borderWidth: active ? 2 : StyleSheet.hairlineWidth,
                },
                pressed && { opacity: 0.95 },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h2, { color: theme.text }]}>
                    {t(`account.subscriptionCreate.plans.${planKey}.name`)}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[typography.display, { color: theme.text }]}>
                      {formatPrice(plan, currencySymbol)}
                    </Text>
                    <Text
                      style={[
                        typography.bodySm,
                        {
                          color: theme.textMuted,
                          marginLeft: 4,
                          marginBottom: 6,
                        },
                      ]}
                    >
                      {t(intervalKey(plan.interval))}
                    </Text>
                  </View>
                </View>
                {plan.plan === "PRO" ? (
                  <Badge
                    label={t("account.subscriptionCreate.popular")}
                    tone="primary"
                  />
                ) : null}
              </View>

              <View style={styles.features}>
                {Array.from({ length: featureCount }, (_, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.primary}
                    />
                    <Text
                      style={[typography.body, { color: theme.text, flex: 1 }]}
                    >
                      {t(`account.subscriptionCreate.plans.${planKey}.features.${i}`)}
                    </Text>
                  </View>
                ))}
              </View>

              <View
                style={[
                  styles.radio,
                  { borderColor: active ? theme.primary : theme.border },
                ]}
              >
                {active ? (
                  <View
                    style={[styles.radioDot, { backgroundColor: theme.primary }]}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button
          title={t("account.subscriptionCreate.action")}
          loading={isPending}
          disabled={!selectedPlan}
          onPress={handleSubmit}
        />
        <Text
          style={[
            typography.caption,
            {
              color: theme.textMuted,
              textAlign: "center",
              marginTop: spacing.sm,
            },
          ]}
        >
          {t("account.subscriptionCreate.terms")}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  card: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: spacing.xs,
  },
  features: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  radio: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
