import React from "react";
import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Badge,
  EmptyState,
  ListItem,
  ScreenContainer,
  ScreenHeader,
  Skeleton,
} from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { useSubscriptionHistory } from "@/features/subscription/hooks/useSubscription";
import type { InvoiceHistoryItem } from "@/features/subscription/types";

// TODO: backend returns Stripe invoices via GET /subscription/me/history.
// Each item is a Stripe invoice record, not a subscription object.

type InvoiceStatus = NonNullable<InvoiceHistoryItem["status"]>;

const STATUS_TONE: Record<
  InvoiceStatus,
  "neutral" | "primary" | "success" | "warning" | "danger"
> = {
  paid:          "success",
  open:          "warning",
  draft:         "neutral",
  void:          "neutral",
  uncollectible: "danger",
};

export default function SubscriptionHistoryScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { data: invoices = [], isLoading } = useSubscriptionHistory();

  const fmt = (ms: number) =>
    new Intl.DateTimeFormat(i18n.language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(ms));

  // ─── Loading ─────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionHistory.title")} />
        <View style={{ gap: spacing.sm }}>
          <Skeleton height={68} />
          <Skeleton height={68} />
          <Skeleton height={68} />
        </View>
      </ScreenContainer>
    );
  }

  // ─── Empty ───────────────────────────────────────────────────────

  if (invoices.length === 0) {
    return (
      <ScreenContainer scroll>
        <ScreenHeader title={t("account.subscriptionHistory.title")} />
        <EmptyState
          icon="receipt-outline"
          title={t("account.subscriptionHistory.empty")}
          description={t("account.subscriptionHistory.emptyDescription")}
        />
      </ScreenContainer>
    );
  }

  // ─── List ────────────────────────────────────────────────────────

  return (
    <ScreenContainer scroll>
      <ScreenHeader title={t("account.subscriptionHistory.title")} />

      <Text
        style={[
          typography.caption,
          {
            color: theme.textMuted,
            marginBottom: spacing.sm,
            marginLeft: spacing.sm,
            letterSpacing: 0.5,
          },
        ]}
      >
        {t("account.subscriptionHistory.invoices").toUpperCase()}
      </Text>

      <View style={styles.list}>
        {invoices.map((inv) => {
          const statusKey = inv.status ?? "unknown";
          const tone = inv.status ? STATUS_TONE[inv.status] : "neutral";
          const viewUrl = inv.hostedInvoiceUrl;
          const pdfUrl = inv.invoicePdf;

          return (
            <ListItem
              key={inv.id}
              icon="receipt-outline"
              title={inv.number ?? inv.id}
              subtitle={fmt(inv.created)}
              trailingTitle={`${t(`currency.${inv.currency}`)} ${(inv.amountPaid / 100).toFixed(2)}`}
              onPress={viewUrl ? () => Linking.openURL(viewUrl) : undefined}
              right={
                <View style={styles.invoiceRight}>
                  <Badge
                    label={t(`account.subscriptionHistory.status.${statusKey}`)}
                    tone={tone}
                  />
                  <View style={styles.invoiceActions}>
                    {viewUrl ? (
                      <Pressable
                        onPress={() => Linking.openURL(viewUrl)}
                        accessibilityRole="button"
                        accessibilityLabel={t("account.subscriptionHistory.viewInvoice")}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="open-outline"
                          size={16}
                          color={theme.primary}
                        />
                      </Pressable>
                    ) : null}
                    {pdfUrl ? (
                      <Pressable
                        onPress={() => Linking.openURL(pdfUrl)}
                        accessibilityRole="button"
                        accessibilityLabel={t("account.subscriptionHistory.downloadPdf")}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="download-outline"
                          size={16}
                          color={theme.primary}
                        />
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              }
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  invoiceRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  invoiceActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
