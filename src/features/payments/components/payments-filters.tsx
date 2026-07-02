import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { FilterChips, SearchBar } from "@/shared/components/ui";
import { spacing, useTheme } from "@/core/theme";
import { PaymentStatus } from "../types";

const STATUS_FILTERS = ["all", ...Object.values(PaymentStatus)];

interface PaymentsFiltersProps {
  query: string;
  onQueryChange: (q: string) => void;
  status: string;
  onStatusChange: (s: string) => void;
}

export function PaymentsFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
}: PaymentsFiltersProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const chips = STATUS_FILTERS.map((s) => ({
    key: s,
    label: t(`org.paymentsPage.status.${s}`),
  }));

  return (
    <View style={[styles.bar, { borderBottomColor: theme.border }]}>
      <SearchBar
        value={query}
        onChangeText={onQueryChange}
        placeholder={t("org.paymentsPage.search")}
      />
      <FilterChips chips={chips} selected={status} onSelect={onStatusChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
