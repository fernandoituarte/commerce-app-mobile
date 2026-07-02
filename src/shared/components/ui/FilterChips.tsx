import React from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { radius, spacing, typography, useTheme } from "../../../core/theme";

interface Chip {
  key: string;
  label: string;
  count?: number;
}

interface FilterChipsProps {
  chips: Chip[];
  selected: string;
  onSelect: (key: string) => void;
}

export function FilterChips({ chips, selected, onSelect }: FilterChipsProps) {
  const t = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => {
        const active = selected === chip.key;
        return (
          <Pressable
            key={chip.key}
            onPress={() => onSelect(chip.key)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active ? t.primary : t.surface,
                borderColor: active ? t.primary : t.border,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={[
                typography.bodySm,
                { color: active ? "#fff" : t.text, fontWeight: active ? "600" : "400" },
              ]}
            >
              {chip.label}
              {chip.count !== undefined ? ` (${chip.count})` : ""}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm, paddingVertical: 2 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
