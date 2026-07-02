import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

interface SettingsGroupProps {
  title?: string;
  footer?: string;
  children: React.ReactNode;
}

export function SettingsGroup({ title, footer, children }: SettingsGroupProps) {
  const t = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View style={styles.wrap}>
      {title ? (
        <Text
          style={[
            typography.caption,
            styles.title,
            { color: t.textMuted },
          ]}
        >
          {title.toUpperCase()}
        </Text>
      ) : null}

      <View
        style={[
          styles.card,
          { backgroundColor: t.surfaceAlt, borderColor: t.border },
        ]}
      >
        {items.map((child, idx) => (
          <View key={idx}>
            {child}
            {idx < items.length - 1 ? (
              <View
                style={[styles.divider, { backgroundColor: t.border }]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {footer ? (
        <Text
          style={[
            typography.bodySm,
            { color: t.textMuted, marginTop: spacing.sm },
          ]}
        >
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  title: {
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
});
