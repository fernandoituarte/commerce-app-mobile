import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface SettingsRowProps {
  icon?: IconName;
  iconColor?: string;
  iconBg?: string;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  chevron?: boolean;
  right?: React.ReactNode;
}

export function SettingsRow({
  icon,
  iconColor,
  iconBg,
  label,
  subtitle,
  value,
  onPress,
  destructive,
  chevron,
  right,
}: SettingsRowProps) {
  const t = useTheme();
  const showChevron = chevron ?? !!onPress;
  const labelColor = destructive ? t.danger : t.text;

  const content = (
    <View style={styles.row}>
      {icon ? (
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor:
                iconBg ?? (destructive ? t.dangerSoft : t.primarySoft),
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={iconColor ?? (destructive ? t.danger : t.primary)}
          />
        </View>
      ) : null}

      <View style={styles.textCol}>
        <Text style={[typography.body, { color: labelColor }]}>{label}</Text>
        {subtitle ? (
          <Text
            style={[typography.bodySm, { color: t.textMuted, marginTop: 2 }]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text
          style={[typography.bodySm, { color: t.textMuted, marginRight: 4 }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      ) : null}

      {right}

      {showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={t.textMuted} />
      ) : null}
    </View>
  );

  if (!onPress) return <View style={styles.pressable}>{content}</View>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { backgroundColor: t.surface },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md - 2,
    gap: spacing.md,
    minHeight: 56,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: { flex: 1 },
});
