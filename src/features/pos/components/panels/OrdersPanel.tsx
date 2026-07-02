import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FilterChips } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useOrders } from "@/features/orders/hooks";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { NewOrderModal } from "./NewOrderModal";
import type { Order } from "@/features/orders/types";
import { OrderStatus, POS_ACTIVE_ORDER_STATUSES } from "@/features/orders/types";

// "all" in the POS means all active statuses — never COMPLETED/CANCELLED.
const STATUS_FILTERS: Array<"all" | OrderStatus> = [
  "all",
  ...POS_ACTIVE_ORDER_STATUSES,
];

function elapsed(iso: string | Date): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.round(m / 60)}h`;
}

interface OrdersPanelProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onOrderCreated?: (id: string) => void;
}

export function OrdersPanel({
  selectedId,
  onSelect,
  onOrderCreated,
}: OrdersPanelProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = useSubscriptionAccess();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError, refetch } = useOrders({
    limit: 50,
    offset: 0,
    status: POS_ACTIVE_ORDER_STATUSES,
  });

  const orders = data?.items ?? [];
  const displayed =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const chips = STATUS_FILTERS.map((f) => ({
    key: f,
    label:
      f === "all"
        ? t("org.orders.status.all")
        : t(`org.orders.status.${f}`),
    count:
      f === "all"
        ? orders.length
        : orders.filter((o) => o.status === f).length,
  }));

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      <NewOrderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onOrderCreated={(order) => {
          setShowModal(false);
          onOrderCreated?.(order.id);
        }}
      />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[typography.h3, { color: theme.text, flex: 1 }]}>
          {t("pos.orders.title")}
        </Text>
        <Pressable
          onPress={() => setShowModal(true)}
          disabled={!canWrite}
          style={({ pressed }) => [
            styles.newBtn,
            { backgroundColor: canWrite ? theme.primary : theme.border },
            pressed && canWrite && { opacity: 0.75 },
          ]}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text
            style={[typography.bodySm, { color: "#fff", fontWeight: "700" }]}
          >
            {t("pos.orders.newOrder")}
          </Text>
        </Pressable>
      </View>

      {/* Status filter chips */}
      <View
        style={[styles.filterWrap, { borderBottomColor: theme.border }]}
      >
        <FilterChips
          chips={chips}
          selected={filter}
          onSelect={(k) => setFilter(k as "all" | OrderStatus)}
        />
      </View>

      {/* Content: loading / error / list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={32} color={theme.textMuted} />
          <Text
            style={[
              typography.bodySm,
              { color: theme.textMuted, textAlign: "center" },
            ]}
          >
            {t("pos.orders.error")}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [
              styles.retryBtn,
              { borderColor: theme.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[typography.bodySm, { color: theme.primary }]}>
              {t("pos.orders.retry")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color={theme.textMuted}
              />
              <Text
                style={[
                  typography.bodySm,
                  { color: theme.textMuted, textAlign: "center" },
                ]}
              >
                {t("pos.orders.empty")}
              </Text>
            </View>
          }
          renderItem={({ item: o }: { item: Order }) => (
            <Pressable
              onPress={() => onSelect(o.id)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor:
                    selectedId === o.id
                      ? theme.primarySoft
                      : theme.surfaceAlt,
                  borderColor:
                    selectedId === o.id ? theme.primary : theme.border,
                },
                pressed && { opacity: 0.82 },
              ]}
            >
              <View style={styles.cardRow}>
                <View style={styles.numberWrap}>
                  <Text style={[typography.h3, { color: theme.text }]}>
                    #{o.orderNumber}
                  </Text>
                  <Text
                    style={[
                      typography.caption,
                      { color: theme.textMuted },
                    ]}
                  >
                    {elapsed(o.createdAt)}
                  </Text>
                </View>
                <OrderStatusBadge status={o.status} />
              </View>
              <View style={styles.cardRow}>
                <Text
                  style={[
                    typography.bodySm,
                    { color: theme.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {o.customerName ?? "—"}
                </Text>
                <Text style={[typography.h3, { color: theme.text }]}>
                  {(o.currency ?? "").toUpperCase()} {o.total.toFixed(2)}
                </Text>
              </View>
              <Text
                style={[
                  typography.caption,
                  { color: theme.textMuted, marginTop: 2 },
                ]}
              >
                {o.items.length} {t("pos.detail.items")}
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  filterWrap: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  list: { padding: spacing.sm, gap: spacing.sm },
  center: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  numberWrap: { gap: 2 },
});
