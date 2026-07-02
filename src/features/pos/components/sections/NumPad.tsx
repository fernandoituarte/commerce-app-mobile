import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { radius, spacing, typography, useTheme } from "@/core/theme";

interface NumPadProps {
  onKey: (key: string) => void;
}

const ROWS = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
  [".", "0", "⌫"],
];

export function NumPad({ onKey }: NumPadProps) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {ROWS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key) => {
            const isDelete = key === "⌫";
            return (
              <Pressable
                key={key}
                onPress={() => onKey(key)}
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor: isDelete
                      ? theme.dangerSoft
                      : theme.surface,
                    borderColor: theme.border,
                  },
                  pressed && { opacity: 0.5, transform: [{ scale: 0.94 }] },
                ]}
              >
                <Text
                  style={[
                    styles.keyText,
                    {
                      color: isDelete ? theme.danger : theme.text,
                      fontWeight: isDelete ? "600" : "500",
                    },
                  ]}
                >
                  {key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm },
  key: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  keyText: { fontSize: 22, lineHeight: 28 },
});
