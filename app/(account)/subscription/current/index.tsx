import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ScreenContainer,
  ScreenHeader,
  SettingsGroup,
  SettingsRow,
  Skeleton,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import {
  useCancelSubscription,
  useChangePlan,
  useResumeSubscription,
  useSubscription,
} from "@/features/subscription/hooks/useSubscription";
import type { SubscriptionPlan, SubscriptionStatus } from "@/features/subscription/types";

const STATUS_TONE = {
  TRIAL:       "neutral",
  PROCESSING:  "warning",
  ACTIVE:      "success",
  PAST_DUE:    "warning",
  CANCELED:    "danger",
  EXPIRED:     "neutral",
  INCOMPLETE:  "warning",
  PAUSED:      "neutral",
} as const satisfies Record<SubscriptionStatus, "neutral" | "primary" | "success" | "warning" | "danger">;

export default function SubscriptionCurrentScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { data, isLoading, refetch } = useSubscription();
  const cancelMutation = useCancelSubscription();
  const resumeMutation = useResumeSubscription();
  const changePlanMutation = useChangePlan();
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [changePlanOpen, setChangePlanOpen] = React.useState(false);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(iso));

  // ─── Loading ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionCurrent.title")} />
        <View style={{ gap: spacing.md }}>
          <Skeleton height={160} style={{ borderRadius: radius.xl }} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </View>
      </ScreenContainer>
    );
  }

  // ─── PROCESSING: checkout started but not complete ───────────────

  if (data?.status === "PROCESSING") {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionCurrent.title")} />
        <View style={styles.pending}>
          <View style={[styles.pendingIconCircle, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="hourglass-outline" size={32} color={theme.primary} />
          </View>
          <Text style={[typography.h3, { color: theme.text, textAlign: "center", marginTop: spacing.md }]}>
            {t("account.subscriptionCurrent.processingTitle")}
          </Text>
          <Text style={[typography.body, { color: theme.textMuted, textAlign: "center", marginTop: spacing.xs }]}>
            {t("account.subscriptionCurrent.processingDescription")}
          </Text>
          <View style={styles.pendingActions}>
            <Button
              title={t("account.subscriptionCurrent.continueSubscription")}
              onPress={() => router.push("/(account)/subscription/create")}
            />
            <Text style={[typography.bodySm, { color: theme.textMuted, textAlign: "center" }]}>
              {t("account.subscriptionCurrent.alreadyPaidHint")}
            </Text>
            <Button
              title={t("account.subscriptionCurrent.refresh")}
              variant="ghost"
              onPress={() => refetch()}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // ─── No usable subscription (null, CANCELED, EXPIRED) ───────────

  const hasUsableSubscription =
    !!data && data.status !== "CANCELED" && data.status !== "EXPIRED";

  if (!hasUsableSubscription) {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionCurrent.title")} />
        <EmptyState
          icon="card-outline"
          title={t("account.subscriptionCurrent.noSubscription")}
          description={t("account.subscriptionCurrent.noSubscriptionDescription")}
          actionLabel={t("account.subscriptionCurrent.subscribe")}
          onAction={() => router.push("/(account)/subscription/create")}
        />
      </ScreenContainer>
    );
  }

  // ─── Derived flags (data is non-null and not CANCELED/EXPIRED) ───

  const renewal = fmt(data.currentPeriodEnd);
  const otherPlan: SubscriptionPlan = data.plan === "BASIC" ? "PRO" : "BASIC";
  const isUpgrade = data.plan === "BASIC"; // BASIC → PRO

  // Show Cancel only when active and not already scheduled to cancel.
  const showCancel = data.status === "ACTIVE" && !data.cancelAtPeriodEnd;
  // Show Reactivate whenever a pending cancellation is scheduled.
  const showReactivate = data.cancelAtPeriodEnd;

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t("account.subscriptionCurrent.title")} />

      {/* ── Hero card ── */}
      <View
        style={[
          styles.hero,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={[typography.bodySm, { color: theme.textMuted }]}>
              {t("account.subscriptionCurrent.activePlan")}
            </Text>
            <Text style={[typography.h1, { color: theme.text, marginTop: 2 }]}>
              {data.plan}
            </Text>
          </View>
          <Badge
            label={t(`account.subscriptionCurrent.status.${data.status.toLowerCase()}`)}
            tone={STATUS_TONE[data.status]}
          />
        </View>

        <View style={styles.priceRow}>
          <Text style={[typography.display, { color: theme.text }]}>
            {t(`currency.${data.currency}`)} {(data.priceAmount || 0) / 100}
          </Text>
          <Text
            style={[typography.body, { color: theme.textMuted, marginLeft: 6, marginBottom: 6 }]}
          >
            {t("account.subscriptionCreate.perMonth")}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.metaRow}>
          <Ionicons
            name={data.cancelAtPeriodEnd ? "time-outline" : "refresh-outline"}
            size={18}
            color={theme.textMuted}
          />
          <Text style={[typography.bodySm, { color: theme.textMuted, flex: 1 }]}>
            {data.cancelAtPeriodEnd
              ? t("account.subscriptionCurrent.cancelsOn", { date: renewal })
              : t("account.subscriptionCurrent.renewsOn", { date: renewal })}
          </Text>
        </View>
      </View>

      {/* ── Billing settings ── */}
      <SettingsGroup title={t("account.subscriptionCurrent.billing")}>
        <SettingsRow
          icon="receipt-outline"
          label={t("account.subscription.history")}
          onPress={() => router.push("/(account)/subscription/history")}
        />
        <SettingsRow
          icon="swap-horizontal-outline"
          label={t("account.subscriptionCurrent.changePlan")}
          onPress={() => setChangePlanOpen(true)}
        />
      </SettingsGroup>

      {/* ── Reactivate (cancelAtPeriodEnd=true) ── */}
      {showReactivate && (
        <Button
          title={t("account.subscriptionCurrent.reactivate")}
          variant="outline"
          loading={resumeMutation.isPending}
          onPress={() => resumeMutation.mutate(data.id)}
        />
      )}

      {/* ── Cancel (ACTIVE and not already scheduled) ── */}
      {showCancel && (
        <Button
          title={t("account.subscriptionCurrent.cancel")}
          variant="outline"
          loading={cancelMutation.isPending}
          onPress={() => setCancelOpen(true)}
        />
      )}

      {/* ── Cancel confirm dialog ── */}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={t("account.subscriptionCurrent.cancelConfirmTitle")}
        description={t("account.subscriptionCurrent.cancelConfirmDescription")}
        confirmLabel={t("account.subscriptionCurrent.cancel")}
        cancelLabel={t("account.actions.cancel")}
        destructive
        onConfirm={() => cancelMutation.mutate(data.id)}
      />

      {/* ── Change-plan dialog ── */}
      <ConfirmDialog
        open={changePlanOpen}
        onOpenChange={setChangePlanOpen}
        title={t("account.subscriptionCurrent.changePlanTitle")}
        description={
          t("account.subscriptionCurrent.changePlanDescription", { plan: otherPlan }) +
          "\n\n" +
          (isUpgrade
            ? t("account.subscriptionCurrent.changePlanUpgradeHint")
            : t("account.subscriptionCurrent.changePlanDowngradeHint"))
        }
        confirmLabel={t("account.subscriptionCurrent.changePlanConfirm")}
        cancelLabel={t("account.actions.cancel")}
        onConfirm={() => changePlanMutation.mutate({ id: data.id, plan: otherPlan })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pending: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  pendingIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  pendingActions: {
    marginTop: spacing.lg,
    width: "60%",
    gap: spacing.sm,
  },
});
