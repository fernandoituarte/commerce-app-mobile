import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface StatCardProps {
  icon: IconName;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
}

export function StatCard({ icon, label, value, change, changeLabel }: StatCardProps) {
  const t = useTheme();
  const up = change !== undefined && change >= 0;
  const neutral = change === undefined;

  return (
    <View
      style={[styles.card, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: t.primarySoft }]}>
        <Ionicons name={icon} size={20} color={t.primary} />
      </View>
      <Text style={[typography.caption, { color: t.textMuted, marginTop: spacing.sm }]}>
        {label}
      </Text>
      <Text style={[typography.h2, { color: t.text, marginTop: 2 }]}>{value}</Text>
      {!neutral && (
        <View style={styles.changeRow}>
          <Ionicons
            name={up ? "trending-up-outline" : "trending-down-outline"}
            size={14}
            color={up ? t.success : t.danger}
          />
          <Text
            style={[
              typography.caption,
              { color: up ? t.success : t.danger },
            ]}
          >
            {up ? "+" : ""}
            {change?.toFixed(1)}%{changeLabel ? ` ${changeLabel}` : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 140,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
  },
});
