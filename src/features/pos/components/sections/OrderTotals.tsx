import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { TAX_RATE } from "../../constants/pos";
import { spacing, typography, useTheme } from "@/core/theme";
import type { POSOrderItem } from "../../mocks/pos";

interface OrderTotalsProps {
  items: POSOrderItem[];
}

export function OrderTotals({ items }: OrderTotalsProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <View style={[styles.wrap, { borderTopColor: theme.border }]}>
      <View style={styles.totalRow}>
        <Text style={[typography.h3, { color: theme.text }]}>{t("pos.detail.total")}</Text>
        <Text style={[styles.totalAmount, { color: theme.text }]}>${total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

function Row({ label, value, theme, muted }: { label: string; value: string; theme: any; muted?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[typography.bodySm, { color: muted ? theme.textMuted : theme.text }]}>{label}</Text>
      <Text style={[typography.bodySm, { color: muted ? theme.textMuted : theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.md, gap: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.sm },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalAmount: { fontSize: 22, fontWeight: "800", lineHeight: 28 },
});
