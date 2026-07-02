import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface ListItemProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  trailingTitle?: string;
  trailingSubtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}

export function ListItem({
  icon,
  title,
  subtitle,
  trailingTitle,
  trailingSubtitle,
  onPress,
  right,
}: ListItemProps) {
  const t = useTheme();

  const inner = (
    <View
      style={[
        styles.row,
        { backgroundColor: t.surfaceAlt, borderColor: t.border },
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: t.primarySoft }]}>
          <Ionicons name={icon} size={18} color={t.primary} />
        </View>
      ) : null}

      <View style={styles.textCol}>
        <Text
          style={[typography.body, { color: t.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              typography.bodySm,
              { color: t.textMuted, marginTop: 2 },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailingTitle || trailingSubtitle ? (
        <View style={styles.trail}>
          {trailingTitle ? (
            <Text style={[typography.body, { color: t.text }]}>
              {trailingTitle}
            </Text>
          ) : null}
          {trailingSubtitle ? (
            <Text style={[typography.caption, { color: t.textMuted }]}>
              {trailingSubtitle}
            </Text>
          ) : null}
        </View>
      ) : null}

      {right}
    </View>
  );

  if (!onPress) return inner;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
    >
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
  trail: { alignItems: "flex-end" },
});
