import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Badge, EmptyState } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { PaymentMethod, PaymentMethodsResponse } from "../types";

interface PaymentMethodsListProps {
  data: PaymentMethodsResponse | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (item: PaymentMethod) => void;
  onDelete: (item: PaymentMethod) => void;
  onRestore: (item: PaymentMethod) => void;
  onCreatePress: () => void;
  canWrite?: boolean;
}

export function PaymentMethodsList({
  data,
  isLoading,
  page,
  onPageChange,
  onEdit,
  onDelete,
  onRestore,
  onCreatePress,
  canWrite = true,
}: PaymentMethodsListProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (!isLoading && (!data || data.items.length === 0)) {
    return (
      <EmptyState
        icon="card-outline"
        title={t("org.payment.empty")}
        description={t("org.payment.emptyDescription")}
        actionLabel={t("org.payment.create")}
        onAction={onCreatePress}
      />
    );
  }

  return (
    <FlatList
      data={data?.items ?? []}
      keyExtractor={(item) => item.id}
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
      renderItem={({ item }) => (
        <View
          style={[
            styles.row,
            { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
            !item.isActive && { opacity: 0.55 },
          ]}
        >
          {/* Icon */}
          <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="card-outline" size={18} color={theme.primary} />
          </View>

          {/* Info */}
          <View style={styles.rowBody}>
            <Text
              style={[typography.body, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.description ? (
              <Text
                style={[typography.caption, { color: theme.textMuted }]}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            ) : null}
            <View style={styles.badges}>
              <Badge
                label={
                  item.isActive
                    ? t("org.payment.active")
                    : t("org.payment.inactive")
                }
                tone={item.isActive ? "success" : "neutral"}
              />
              {item.isDefault && (
                <Badge label={t("org.payment.default")} tone="primary" />
              )}
              {item.isSystem && (
                <Badge label={t("org.payment.system")} tone="warning" />
              )}
            </View>
          </View>

          {/* Sort order */}
          <Text
            style={[
              typography.caption,
              { color: theme.textMuted, minWidth: 24, textAlign: "right" },
            ]}
          >
            #{item.sortOrder}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              hitSlop={8}
              disabled={!canWrite}
              onPress={canWrite ? () => onEdit(item) : undefined}
              style={({ pressed }) => [
                pressed && canWrite && { opacity: 0.5 },
                !canWrite && { opacity: 0.4 },
              ]}
            >
              <Ionicons
                name="pencil-outline"
                size={16}
                color={theme.primary}
              />
            </Pressable>

            {item.deletedAt !== null ? (
              <Pressable
                hitSlop={8}
                disabled={!canWrite}
                onPress={canWrite ? () => onRestore(item) : undefined}
                style={({ pressed }) => [
                  pressed && canWrite && { opacity: 0.5 },
                  !canWrite && { opacity: 0.4 },
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={theme.primary}
                />
              </Pressable>
            ) : (
              <Pressable
                hitSlop={8}
                disabled={item.isSystem || !canWrite}
                onPress={item.isSystem || !canWrite ? undefined : () => onDelete(item)}
                style={({ pressed }) => [
                  !item.isSystem && canWrite && pressed && { opacity: 0.5 },
                  (item.isSystem || !canWrite) && { opacity: 0.25 },
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={theme.textMuted}
                />
              </Pressable>
            )}
          </View>
        </View>
      )}
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
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowBody: { flex: 1 },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pageBtn: { padding: spacing.sm },
});
