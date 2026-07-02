import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SearchBar } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";

interface PaymentMethodsFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  withDeleted: boolean;
  onToggleDeleted: () => void;
}

export function PaymentMethodsFilters({
  query,
  onQueryChange,
  withDeleted,
  onToggleDeleted,
}: PaymentMethodsFiltersProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.bar, { borderBottomColor: theme.border }]}>
      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        placeholder={t("org.payment.search")}
      />
      <Pressable
        onPress={onToggleDeleted}
        style={[
          styles.toggle,
          { borderColor: theme.border },
          withDeleted && {
            backgroundColor: theme.primarySoft,
            borderColor: theme.primary,
          },
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
          {t("org.payment.showDeleted")}
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
