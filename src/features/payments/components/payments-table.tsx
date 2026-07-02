import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { PaymentStatusBadge } from "./payment-status-badge";
import { PaymentProviderBadge } from "./payment-provider-badge";
import { PaymentStatus } from "../types";
import type { Payment, PaymentsResponse } from "../types";

// ─── Constants ────────────────────────────────────────────────────

const CANCELLABLE = new Set<PaymentStatus>([
  PaymentStatus.PENDING,
  PaymentStatus.COMPLETED,
]);

// ─── Helpers ──────────────────────────────────────────────────────

function fmtAmount(cents: number, currency: string): string {
  return `${currency.toUpperCase()} ${(cents / 100).toFixed(2)}`;
}

// ─── Component ────────────────────────────────────────────────────

interface PaymentsTableProps {
  data: PaymentsResponse | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onCancel: (item: Payment) => void;
  onCreatePress: () => void;
  canWrite?: boolean;
}

export function PaymentsTable({
  data,
  isLoading,
  page,
  onPageChange,
  onCancel,
  onCreatePress,
  canWrite = true,
}: PaymentsTableProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(
      new Date(d),
    );

  if (!isLoading && (!data || data.items.length === 0)) {
    return (
      <EmptyState
        icon="card-outline"
        title={t("org.paymentsPage.empty")}
        description={t("org.paymentsPage.emptyDescription")}
        actionLabel={t("org.paymentsPage.create")}
        onAction={onCreatePress}
      />
    );
  }

  const pager =
    data && data.totalPages > 1 ? (
      <View style={styles.pagination}>
        <Pressable
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          style={[styles.pageBtn, page <= 1 && { opacity: 0.4 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          {page} / {data.totalPages}
        </Text>
        <Pressable
          disabled={!data.hasMore}
          onPress={() => onPageChange(page + 1)}
          style={[styles.pageBtn, !data.hasMore && { opacity: 0.4 }]}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </Pressable>
      </View>
    ) : null;

  return (
    <FlatList
      data={data?.items ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListFooterComponent={pager}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
          ]}
        >
          {/* Top row: amount + status */}
          <View style={styles.cardTop}>
            <View style={styles.cardLeft}>
              <Text
                style={[typography.body, { color: theme.text, fontWeight: "600" }]}
              >
                {fmtAmount(item.amount, item.currency)}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                {item.orderId ? `Order #${item.orderId.slice(0, 8)}` : "—"}
              </Text>
            </View>
            <PaymentStatusBadge status={item.status} />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Bottom row: provider, date, cancel action */}
          <View style={styles.cardBottom}>
            <PaymentProviderBadge
              provider={item.provider}
              methodName={item.paymentMethodName}
            />
            <Text style={[typography.caption, { color: theme.textMuted }]}>
              {fmtDate(item.paidAt ?? item.createdAt)}
            </Text>
            {CANCELLABLE.has(item.status) && (
              <Pressable
                hitSlop={8}
                disabled={!canWrite}
                onPress={canWrite ? () => onCancel(item) : undefined}
                style={({ pressed }) => [
                  pressed && canWrite && { opacity: 0.5 },
                  !canWrite && { opacity: 0.4 },
                ]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={theme.danger}
                />
              </Pressable>
            )}
          </View>
        </View>
      )}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 80 },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardLeft: { gap: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.sm },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pageBtn: { padding: spacing.sm },
});
