import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { spacing, typography, useTheme } from "@/core/theme";

export type PosTab = "orders" | "detail" | "products";

interface PosBottomNavProps {
  activeTab: PosTab;
  onTabChange: (tab: PosTab) => void;
  pendingCount?: number;
}

const TABS: { key: PosTab; icon: React.ComponentProps<typeof Ionicons>["name"]; labelKey: string }[] = [
  { key: "orders", icon: "list-outline", labelKey: "pos.nav.orders" },
  { key: "detail", icon: "receipt-outline", labelKey: "pos.nav.order" },
  { key: "products", icon: "grid-outline", labelKey: "pos.nav.products" },
];

export function PosBottomNav({ activeTab, onTabChange, pendingCount }: PosBottomNavProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: theme.surfaceAlt, borderTopColor: theme.border }]}>
      {TABS.map((tab) => {
        const active = activeTab === tab.key;
        const showBadge = tab.key === "orders" && (pendingCount ?? 0) > 0;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? theme.primary : theme.textMuted}
              />
              {showBadge && (
                <View style={[styles.badge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: active ? theme.primary : theme.textMuted,
                  fontWeight: active ? "700" : "400",
                },
              ]}
            >
              {t(tab.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: spacing.sm,
    gap: 3,
  },
  iconWrap: { position: "relative" },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
