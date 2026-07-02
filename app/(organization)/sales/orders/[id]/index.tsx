import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { Button, Skeleton } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useOrderDetails } from "@/features/orders/hooks";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { UpdateOrderStatusDialog } from "@/features/orders/components/update-order-status-dialog";
import type { OrderItem } from "@/features/orders/types";

function ItemRow({ item }: { item: OrderItem }) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={[
        rowStyles.wrap,
        { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
      ]}
    >
      <View style={rowStyles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={[typography.body, { color: theme.text, fontWeight: "600" }]}
          >
            {item.name}
          </Text>
          <Text style={[typography.bodySm, { color: theme.textMuted }]}>
            ${item.unitPrice.toFixed(2)} × {item.quantity}
          </Text>
        </View>
        <Text style={[typography.h3, { color: theme.text }]}>
          ${item.total.toFixed(2)}
        </Text>
      </View>
      {item.extras.length > 0 && (
        <View style={rowStyles.sub}>
          <Text
            style={[
              typography.caption,
              { color: theme.textMuted, marginBottom: 2 },
            ]}
          >
            {t("org.orders.detail.extras").toUpperCase()}
          </Text>
          {item.extras.map((e) => (
            <Text
              key={e.id}
              style={[typography.caption, { color: theme.textMuted }]}
            >
              + {e.name} ×{e.quantity} ${e.price.toFixed(2)}
            </Text>
          ))}
        </View>
      )}
      {item.removedIngredients.length > 0 && (
        <View style={rowStyles.sub}>
          <Text
            style={[
              typography.caption,
              { color: theme.textMuted, marginBottom: 2 },
            ]}
          >
            {t("org.orders.detail.removedIngredients").toUpperCase()}
          </Text>
          {item.removedIngredients.map((r) => (
            <Text
              key={r.id}
              style={[typography.caption, { color: theme.danger }]}
            >
              — {r.name}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  sub: { paddingTop: spacing.xs, gap: 2 },
});

export default function OrderDetailsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading } = useOrderDetails(id);
  const [updateOpen, setUpdateOpen] = useState(false);
  const { canWrite } = useSubscriptionAccess();

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(d));

  if (isLoading) {
    return (
      <OrgShell title="…" scrollable padded>
        <Skeleton width="50%" height={28} />
        <Skeleton width="35%" height={20} />
        <Skeleton width="100%" height={120} />
        <Skeleton width="100%" height={80} />
      </OrgShell>
    );
  }

  if (!order) return null;

  return (
    <OrgShell title={`#${order.orderNumber}`} scrollable padded>
      {/* Header card */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <View style={styles.row}>
          <Text style={[typography.h2, { color: theme.text }]}>
            #{order.orderNumber}
          </Text>
          <View style={styles.badges}>
            <OrderStatusBadge status={order.status} />
            <OrderStatusBadge status={order.paymentStatus} type="payment" />
          </View>
        </View>
        {order.customerName ? (
          <Text style={[typography.body, { color: theme.textMuted }]}>
            {order.customerName}
          </Text>
        ) : null}
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          {fmtDate(order.createdAt)}
        </Text>
        <Button
          title={t("org.orders.detail.updateStatus")}
          onPress={() => setUpdateOpen(true)}
          disabled={!canWrite}
          size="sm"
          style={{ alignSelf: "flex-start", marginTop: spacing.xs }}
        />
      </View>

      {/* Items */}
      <Text
        style={[
          typography.h3,
          {
            color: theme.text,
            marginTop: spacing.md,
            marginBottom: spacing.sm,
          },
        ]}
      >
        {t("org.orders.detail.items")}
      </Text>
      {(order.items ?? []).length === 0 ? (
        <Text style={[typography.body, { color: theme.textMuted }]}>
          {t("org.orders.detail.noItems")}
        </Text>
      ) : (
        (order.items ?? []).map((item, idx) => (
          <ItemRow key={item.id ?? String(idx)} item={item} />
        ))
      )}

      {/* Summary */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.surfaceAlt,
            borderColor: theme.border,
            marginTop: spacing.sm,
          },
        ]}
      >
        <Text
          style={[
            typography.h3,
            { color: theme.text, marginBottom: spacing.sm },
          ]}
        >
          {t("org.orders.detail.summary")}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={[typography.body, { color: theme.textMuted }]}>
            {t("org.orders.subtotal")}
          </Text>
          <Text style={[typography.body, { color: theme.text }]}>
            {(order.currency ?? "").toUpperCase()} {order.subtotal.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[typography.h3, { color: theme.text }]}>
            {t("org.orders.total")}
          </Text>
          <Text style={[typography.h3, { color: theme.text }]}>
            {(order.currency ?? "").toUpperCase()} {order.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <UpdateOrderStatusDialog
        orderId={updateOpen ? order.id : null}
        currentStatus={order.status}
        onClose={() => setUpdateOpen(false)}
      />
    </OrgShell>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badges: { flexDirection: "row", gap: spacing.xs, alignItems: "center" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
});
