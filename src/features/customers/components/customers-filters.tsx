import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";

interface CustomersFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  withDeleted: boolean;
  onWithDeletedChange: (v: boolean) => void;
}

export function CustomersFilters({
  query,
  onQueryChange,
  withDeleted,
  onWithDeletedChange,
}: CustomersFiltersProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.bar, { borderBottomColor: theme.border }]}>
      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        placeholder={t("org.clients.search")}
      />
      <Pressable
        onPress={() => onWithDeletedChange(!withDeleted)}
        style={[
          styles.toggle,
          { borderColor: theme.border },
          withDeleted && { backgroundColor: theme.primarySoft, borderColor: theme.primary },
        ]}
      >
        <Ionicons
          name={withDeleted ? "eye-outline" : "eye-off-outline"}
          size={14}
          color={withDeleted ? theme.primary : theme.textMuted}
        />
        <Text
          style={[
            typography.caption,
            { color: withDeleted ? theme.primary : theme.textMuted },
          ]}
        >
          {t("org.clients.showDeleted")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
