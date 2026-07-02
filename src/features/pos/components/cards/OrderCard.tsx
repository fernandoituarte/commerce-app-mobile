import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Badge } from "@/shared/components/ui";
import { ORDER_STATUS_TONE, ORDER_STATUS_DOT } from "../../constants/pos";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { POSOrder } from "../../mocks/pos";

interface OrderCardProps {
  order: POSOrder;
  selected?: boolean;
  onPress?: () => void;
}

function elapsed(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.round(m / 60)}h`;
}

export function OrderCard({ order, selected, onPress }: OrderCardProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? theme.primarySoft : theme.surfaceAlt,
          borderColor: selected ? theme.primary : theme.border,
          borderLeftColor: ORDER_STATUS_DOT[order.status],
        },
        pressed && { opacity: 0.82 },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.numberWrap}>
          <Text style={[typography.h3, { color: theme.text }]}>{order.number}</Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            {elapsed(order.createdAt)}
          </Text>
        </View>
        <Badge
          label={t(`pos.orders.status.${order.status}`)}
          tone={ORDER_STATUS_TONE[order.status]}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.tableRow}>
          <Ionicons name="location-outline" size={13} color={theme.textMuted} />
          <Text style={[typography.bodySm, { color: theme.textMuted }]}>{order.table}</Text>
        </View>
        <Text style={[typography.h3, { color: theme.text }]}>
          ${order.total.toFixed(2)}
        </Text>
      </View>

      <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
        {order.itemCount} {t("pos.detail.items")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberWrap: { gap: 2 },
  tableRow: { flexDirection: "row", alignItems: "center", gap: 4 },
});
