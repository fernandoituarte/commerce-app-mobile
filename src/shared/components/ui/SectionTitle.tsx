import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { spacing, typography, useTheme } from "../../../core/theme";

interface SectionTitleProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionTitle({ title, actionLabel, onAction }: SectionTitleProps) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[typography.h3, { color: t.text, flex: 1 }]}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[typography.bodySm, { color: t.primary, fontWeight: "600" }]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
});
