import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

interface DangerZoneProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function DangerZone({ title, description, children }: DangerZoneProps) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        { borderColor: t.danger, backgroundColor: t.dangerSoft },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name="warning-outline" size={18} color={t.danger} />
        <Text style={[typography.h3, { color: t.danger }]}>{title}</Text>
      </View>
      {description ? (
        <Text
          style={[
            typography.bodySm,
            { color: t.text, marginTop: spacing.sm },
          ]}
        >
          {description}
        </Text>
      ) : null}
      {children ? <View style={{ marginTop: spacing.md }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
});
