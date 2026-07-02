import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FilterChips, SearchBar } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useGetCategories } from "@/features/products/category/hooks";

interface ProductsFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (id: string) => void;
  withDeleted: boolean;
  onWithDeletedChange: (v: boolean) => void;
}

export function ProductsFilters({
  query,
  onQueryChange,
  categoryFilter,
  onCategoryChange,
  withDeleted,
  onWithDeletedChange,
}: ProductsFiltersProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data } = useGetCategories({ limit: 100 });

  const chips = [
    { key: "", label: t("org.products.categories.all") },
    ...(data?.items.map((c) => ({ key: c.id, label: c.name })) ?? []),
  ];

  return (
    <View style={[styles.wrap, { borderBottomColor: theme.border }]}>
      <View style={styles.top}>
        <View style={styles.searchWrap}>
          <SearchBar
            value={query}
            onChangeText={onQueryChange}
            placeholder={t("org.products.search")}
          />
        </View>
      </View>
      <Pressable
        onPress={() => onWithDeletedChange(!withDeleted)}
        style={[
          styles.deletedToggle,
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
          {t("org.products.showDeleted")}
        </Text>
      </Pressable>
      <FilterChips chips={chips} selected={categoryFilter} onSelect={onCategoryChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  searchWrap: { flex: 1 },
  deletedToggle: {
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
