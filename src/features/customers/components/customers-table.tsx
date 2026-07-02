import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Avatar, Badge, EmptyState } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { Customer, Customers } from "@/features/customers/types";

interface CustomersTableProps {
  data: Customers | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  onEdit: (c: Customer) => void;
  onPause: (c: Customer) => void;
  onRestore: (c: Customer) => void;
  onPermanentDelete: (c: Customer) => void;
  canWrite?: boolean;
}

export function CustomersTable({
  data,
  isLoading,
  page,
  onPageChange,
  onEdit,
  onPause,
  onRestore,
  onPermanentDelete,
  canWrite = true,
}: CustomersTableProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  if (!isLoading && (!data || data.customers.length === 0)) {
    return (
      <EmptyState
        icon="people-outline"
        title={t("org.clients.empty")}
        description={t("org.clients.emptyDescription")}
      />
    );
  }

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(d));

  return (
    <FlatList
      data={data?.customers ?? []}
      keyExtractor={(c) => c.id}
      contentContainerStyle={styles.list}
      ListFooterComponent={
        data && data.totalPages > 1 ? (
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
        ) : null
      }
      renderItem={({ item }) => {
        const isPaused = Boolean(item.deletedAt);

        return (
          <View
            style={[
              styles.row,
              { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
              isPaused && styles.rowPaused,
            ]}
          >
            <Avatar name={item.name || item.email} size="sm" />

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    typography.body,
                    { color: theme.text, fontWeight: "600", flexShrink: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {item.name || "—"}
                </Text>
                {isPaused && (
                  <Badge label={t("org.clients.paused")} tone="neutral" />
                )}
              </View>
              <Text
                style={[typography.bodySm, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {item.email}
              </Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                {fmtDate(item.createdAt)}
              </Text>
            </View>

            <View style={styles.actions}>
              {/* Edit */}
              <Pressable
                hitSlop={8}
                disabled={!canWrite}
                onPress={canWrite ? () => onEdit(item) : undefined}
                style={({ pressed }) => [
                  pressed && canWrite && { opacity: 0.5 },
                  !canWrite && { opacity: 0.4 },
                ]}
              >
                <Ionicons name="create-outline" size={18} color={theme.textMuted} />
              </Pressable>

              {/* Pause / Restore */}
              {isPaused ? (
                <Pressable
                  hitSlop={8}
                  disabled={!canWrite}
                  onPress={canWrite ? () => onRestore(item) : undefined}
                  style={({ pressed }) => [
                    pressed && canWrite && { opacity: 0.5 },
                    !canWrite && { opacity: 0.4 },
                  ]}
                >
                  <Ionicons name="play-circle-outline" size={19} color={theme.primary} />
                </Pressable>
              ) : (
                <Pressable
                  hitSlop={8}
                  disabled={!canWrite}
                  onPress={canWrite ? () => onPause(item) : undefined}
                  style={({ pressed }) => [
                    pressed && canWrite && { opacity: 0.5 },
                    !canWrite && { opacity: 0.4 },
                  ]}
                >
                  <Ionicons name="pause-circle-outline" size={19} color={theme.textMuted} />
                </Pressable>
              )}

              {/* Permanent delete */}
              <Pressable
                hitSlop={8}
                disabled={!canWrite}
                onPress={canWrite ? () => onPermanentDelete(item) : undefined}
                style={({ pressed }) => [
                  pressed && canWrite && { opacity: 0.5 },
                  !canWrite && { opacity: 0.4 },
                ]}
              >
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
              </Pressable>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 80 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowPaused: { opacity: 0.6 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "nowrap",
  },
  info: { flex: 1, gap: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pageBtn: { padding: spacing.sm },
});
