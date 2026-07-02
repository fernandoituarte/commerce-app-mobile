import React from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { EmptyState, Skeleton } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { OrderStatusBadge } from "./order-status-badge";
import type { Orders } from "@/features/orders/types";

interface OrdersTableProps {
  data: Orders | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (p: number) => void;
}

export function OrdersTable({ data, isLoading, page, onPageChange }: OrdersTableProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(d));

  const handlePress = (id: string) =>
    router.push(`/(organization)/sales/orders/${id}`);

  if (isLoading) {
    return (
      <View style={styles.skelList}>
        {[100, 85, 90, 75, 95].map((w, i) => (
          <Skeleton key={i} width={`${w}%`} height={60} />
        ))}
      </View>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title={t("org.orders.empty")}
        description={t("org.orders.emptyDescription")}
      />
    );
  }

  const pager =
    data.totalPages > 1 ? (
      <View style={styles.pagination}>
        <Pressable
          disabled={page <= 1}
          onPress={() => onPageChange(page - 1)}
          style={[styles.pageBtn, page <= 1 && { opacity: 0.4 }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </Pressable>
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          {page} / {data.totalPages}
        </Text>
        <Pressable
          disabled={!data.hasMore}
          onPress={() => onPageChange(page + 1)}
          style={[styles.pageBtn, !data.hasMore && { opacity: 0.4 }]}
        >
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </Pressable>
      </View>
    ) : null;

  if (theme.isTablet) {
    const headers = [
      t("org.orders.cols.number"),
      t("org.orders.cols.customer"),
      t("org.orders.cols.total"),
      t("org.orders.cols.status"),
      t("org.orders.cols.payment"),
      t("org.orders.cols.date"),
    ];
    return (
      <ScrollView contentContainerStyle={styles.tableWrap}>
        <View style={[styles.table, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <View style={[styles.tableHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
            {headers.map((h) => (
              <Text key={h} style={[styles.cell, typography.caption, { color: theme.textMuted }]}>
                {h.toUpperCase()}
              </Text>
            ))}
          </View>
          {data.items.map((o, idx) => (
            <Pressable
              key={o.id}
              onPress={() => handlePress(o.id)}
              style={({ pressed }) => [
                styles.tableRow,
                { borderBottomColor: theme.border },
                idx % 2 === 0 && { backgroundColor: theme.surface },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={[styles.cell, typography.body, { color: theme.primary, fontWeight: "600" }]}>
                #{o.orderNumber}
              </Text>
              <Text style={[styles.cell, typography.body, { color: theme.text }]} numberOfLines={1}>
                {o.customerName ?? "—"}
              </Text>
              <Text style={[styles.cell, typography.body, { color: theme.text, fontWeight: "600" }]}>
                {(o.currency ?? "").toUpperCase()} {o.total.toFixed(2)}
              </Text>
              <View style={styles.cell}><OrderStatusBadge status={o.status} /></View>
              <View style={styles.cell}><OrderStatusBadge status={o.paymentStatus} type="payment" /></View>
              <Text style={[styles.cell, typography.caption, { color: theme.textMuted }]}>
                {fmtDate(o.createdAt)}
              </Text>
            </Pressable>
          ))}
        </View>
        {pager}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={data.items}
      keyExtractor={(o) => o.id}
      contentContainerStyle={styles.list}
      ListFooterComponent={pager}
      renderItem={({ item: o }) => (
        <Pressable
          onPress={() => handlePress(o.id)}
          style={({ pressed }) => [
            styles.orderCard,
            { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={[typography.body, { color: theme.text, fontWeight: "600" }]}>
                #{o.orderNumber}
              </Text>
              <Text style={[typography.bodySm, { color: theme.textMuted }]}>
                {o.customerName ?? "—"}
              </Text>
            </View>
            <OrderStatusBadge status={o.status} />
          </View>
          <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />
          <View style={styles.cardBottom}>
            <OrderStatusBadge status={o.paymentStatus} type="payment" />
            <Text style={[typography.caption, { color: theme.textMuted }]}>
              {fmtDate(o.createdAt)}
            </Text>
            <Text style={[typography.h3, { color: theme.text }]}>
              {(o.currency ?? "").toUpperCase()} {o.total.toFixed(2)}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  skelList: { padding: spacing.md, gap: spacing.sm },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 80 },
  orderCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardDivider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.sm },
  cardBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  tableWrap: { padding: spacing.md },
  table: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  tableHeader: { flexDirection: "row", paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  tableRow: { flexDirection: "row", paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  cell: { flex: 1 },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.md },
  pageBtn: { padding: spacing.sm },
});
