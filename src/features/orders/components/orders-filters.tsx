import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { FilterChips, SearchBar } from "@/shared/components/ui";
import { spacing, useTheme } from "@/core/theme";
import { OrderStatus } from "@/features/orders/types";

const DASHBOARD_STATUS_FILTERS: Array<"all" | OrderStatus> = [
  "all",
  OrderStatus.PENDING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.REOPENED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

interface OrdersFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  status: "all" | OrderStatus;
  onStatusChange: (s: "all" | OrderStatus) => void;
}

export function OrdersFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: OrdersFiltersProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const chips = DASHBOARD_STATUS_FILTERS.map((f) => ({
    key: f,
    label: f === "all" ? t("org.orders.status.all") : t(`org.orders.status.${f}`),
  }));

  return (
    <View style={[styles.wrap, { borderBottomColor: theme.border }]}>
      <View style={styles.search}>
        <SearchBar
          value={query}
          onChangeText={onQueryChange}
          placeholder={t("org.orders.search")}
        />
      </View>
      <View style={styles.chips}>
        <FilterChips
          chips={chips}
          selected={status}
          onSelect={(k) => onStatusChange(k as "all" | OrderStatus)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  search: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  chips: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
