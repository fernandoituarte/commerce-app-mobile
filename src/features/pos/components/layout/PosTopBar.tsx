import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Avatar } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";

interface PosTopBarProps {
  compact?: boolean;
  onMenuPress?: () => void;
}

export function PosTopBar({ compact, onMenuPress }: PosTopBarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  if (compact) {
    return (
      <View style={[styles.barCompact, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
        <Pressable onPress={onMenuPress} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.5 }]}>
          <Ionicons name="menu" size={24} color={theme.text} />
        </Pressable>
        <Pressable onPress={() => router.push("/(account)/profile")} hitSlop={8}>
          <Avatar name="Alex Morgan" size="sm" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.bar, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
      <View style={styles.right}>
        <Pressable
          onPress={() => router.push("/(organization)/profile")}
          style={({ pressed }) => [styles.navBtn, { borderColor: theme.border }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="business-outline" size={16} color={theme.textMuted} />
          <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.topBar.org")}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(account)/profile")}
          style={({ pressed }) => [styles.navBtn, { borderColor: theme.border }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="person-outline" size={16} color={theme.textMuted} />
          <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.topBar.account")}</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/(account)/profile")} hitSlop={6}>
          <Avatar name="Alex Morgan" size="sm" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barCompact: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  right: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: "auto" },
  navBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
