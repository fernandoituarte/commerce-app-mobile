import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ITEM_STATUS_TONE } from "../../constants/pos";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { POSOrderItem } from "../../mocks/pos";

interface OrderItemRowProps {
  item: POSOrderItem;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;
}

export function OrderItemRow({ item, onIncrease, onDecrease }: OrderItemRowProps) {
  const theme = useTheme();
  const total = (item.qty * item.unitPrice).toFixed(2);
  const dotColor = {
    new: theme.warning,
    preparing: theme.primary,
    ready: theme.success,
    served: theme.textMuted,
  }[item.status];

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {/* Status dot */}
        <View style={[styles.dot, { backgroundColor: dotColor }]} />

        <View style={styles.info}>
          <Text style={[typography.body, { color: theme.text, fontWeight: "500" }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.note ? (
            <Text style={[typography.caption, { color: theme.textMuted }]} numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
        </View>

        {/* Qty controls */}
        <View style={styles.qtyRow}>
          <Pressable
            onPress={onDecrease}
            hitSlop={6}
            style={({ pressed }) => [
              styles.qtyBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="remove" size={14} color={theme.text} />
          </Pressable>
          <Text style={[typography.body, { color: theme.text, fontWeight: "700", minWidth: 22, textAlign: "center" }]}>
            {item.qty}
          </Text>
          <Pressable
            onPress={onIncrease}
            hitSlop={6}
            style={({ pressed }) => [
              styles.qtyBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="add" size={14} color={theme.text} />
          </Pressable>
        </View>

        {/* Total */}
        <Text style={[typography.body, { color: theme.text, fontWeight: "600", minWidth: 52, textAlign: "right" }]}>
          ${total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing.xs + 2 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  info: { flex: 1 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
