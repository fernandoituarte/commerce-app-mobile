import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";
import { spacing, typography, useTheme } from "../../../core/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: t.primarySoft }]}>
        <Ionicons name={icon} size={32} color={t.primary} />
      </View>
      <Text style={[typography.h3, { color: t.text, textAlign: "center", marginTop: spacing.md }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[typography.body, { color: t.textMuted, textAlign: "center", marginTop: spacing.xs }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ marginTop: spacing.lg, width: "60%" }}>
          <Button title={actionLabel} onPress={onAction} size="sm" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 64 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
});
