import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const t = useTheme();

  const tones: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: t.surface, fg: t.textMuted },
    primary: { bg: t.primarySoft, fg: t.primary },
    success: {
      bg: t.scheme === "dark" ? "rgba(34,197,94,0.18)" : "#dcfce7",
      fg: t.success,
    },
    warning: {
      bg: t.scheme === "dark" ? "rgba(245,158,11,0.18)" : "#fef3c7",
      fg: t.warning,
    },
    danger: { bg: t.dangerSoft, fg: t.danger },
  };

  const c = tones[tone];

  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Text style={[typography.caption, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
});
