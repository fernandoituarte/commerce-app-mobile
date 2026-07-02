import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { OrgShell } from "@/shared/components/OrgShell";
import {
  Badge,
  ConfirmDialog,
  EmptyState,
  FloatingAction,
  FormModal,
  Input,
  SearchBar,
} from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import {
  useCreateExtra,
  useDeleteExtra,
  useGetExtras,
  useRestoreExtra,
  useUpdateExtra,
} from "@/features/products/extras/hooks";
import type { Extra } from "@/features/products/extras/types";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";

// ─── Constants ────────────────────────────────────────────────────

const DEFAULT_FORM = {
  name: "",
  price: "",
};

const LIMIT = 20;

// ─── Helpers ──────────────────────────────────────────────────────

function formatPrice(price: number): string {
  const num = Number(price);
  if (!num) return "$0.00";
  return `+$${num.toFixed(2)}`;
}

// ─── Screen ───────────────────────────────────────────────────────

export default function ExtrasScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editExtra, setEditExtra] = useState<Extra | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Extra | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Extra | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setPage(1);
  }, [query, withDeleted]);

  const { data, isLoading } = useGetExtras({
    search: query || undefined,
    withDeleted,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const createMutation = useCreateExtra();
  const updateMutation = useUpdateExtra(editExtra?.id ?? "");
  const deleteMutation = useDeleteExtra();
  const restoreMutation = useRestoreExtra();

const setField =
  <K extends keyof typeof DEFAULT_FORM>(key: K) =>
  (value: (typeof DEFAULT_FORM)[K]) => {
    const sanitized =
      key === "price"
        ? (value as string).replace(",", ".").replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1")
        : value;
    setForm((f) => ({ ...f, [key]: sanitized as (typeof DEFAULT_FORM)[K] }));
  };
    

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setCreateOpen(true);
  };

  const openEdit = (extra: Extra) => {
    setForm({
      name: extra.name,
      price: String(extra.price),
    });
    setEditExtra(extra);
  };

  const closeModal = () => {
    setCreateOpen(false);
    setEditExtra(null);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      price: parseFloat(form.price) || 0,
    };
    if (editExtra) {
      updateMutation.mutate(payload, { onSuccess: closeModal });
    } else {
      createMutation.mutate(payload, { onSuccess: closeModal });
    }
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        setPendingDelete(null);
      },
    });
  };

  const handleRestore = () => {
    if (!pendingRestore) return;
    restoreMutation.mutate(pendingRestore.id, {
      onSuccess: () => {
        setPendingRestore(null);
      },
    });
  };

  const isModalOpen = createOpen || editExtra !== null;

  return (
    <OrgShell
      title={t("org.extras.title")}
      scrollable={false}
      padded={false}
    >
      {/* ── Search + deleted toggle ─────────────────────────────── */}
      <View style={[styles.bar, { borderBottomColor: theme.border }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t("org.extras.search")}
        />
        <Pressable
          onPress={() => setWithDeleted((v) => !v)}
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
            {t("org.extras.showDeleted")}
          </Text>
        </Pressable>
      </View>

      {/* ── List ────────────────────────────────────────────────── */}
      {!isLoading && data && data.items.length > 0 ? (
        <FlatList
          data={data.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListFooterComponent={
            data.totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  disabled={page <= 1}
                  onPress={() => setPage((p) => p - 1)}
                  style={[styles.pageBtn, page <= 1 && { opacity: 0.4 }]}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={theme.primary}
                  />
                </Pressable>
                <Text
                  style={[typography.caption, { color: theme.textMuted }]}
                >
                  {page} / {data.totalPages}
                </Text>
                <Pressable
                  disabled={!data.hasMore}
                  onPress={() => setPage((p) => p + 1)}
                  style={[styles.pageBtn, !data.hasMore && { opacity: 0.4 }]}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.primary}
                  />
                </Pressable>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={canWrite ? () => openEdit(item) : undefined}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                },
                !item.isActive && { opacity: 0.55 },
                pressed && canWrite && { opacity: 0.75 },
              ]}
            >
              {/* Icon */}
              <View
                style={[
                  styles.icon,
                  { backgroundColor: theme.primarySoft },
                ]}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color={theme.primary}
                />
              </View>

              {/* Info */}
              <View style={styles.rowBody}>
                <Text
                  style={[typography.body, { color: theme.text }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              {/* Price + status */}
              <View style={styles.rowRight}>
                <Text style={[typography.h3, { color: theme.primary }]}>
                  {formatPrice(item.price)}
                </Text>
                <Badge
                  label={
                    item.isActive
                      ? t("org.extras.active")
                      : t("org.extras.inactive")
                  }
                  tone={item.isActive ? "success" : "neutral"}
                />
              </View>

              {/* Action */}
              {item.deletedAt !== null ? (
                <Pressable
                  hitSlop={8}
                  disabled={!canWrite}
                  onPress={canWrite ? () => setPendingRestore(item) : undefined}
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
                  disabled={!canWrite}
                  onPress={canWrite ? () => setPendingDelete(item) : undefined}
                  style={({ pressed }) => [
                    pressed && canWrite && { opacity: 0.5 },
                    !canWrite && { opacity: 0.4 },
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={theme.textMuted}
                  />
                </Pressable>
              )}
            </Pressable>
          )}
        />
      ) : !isLoading ? (
        <EmptyState
          icon="add-circle-outline"
          title={t("org.extras.empty")}
          description={t("org.extras.emptyDescription")}
          actionLabel={t("org.extras.create")}
          onAction={openCreate}
        />
      ) : null}

      <FloatingAction onPress={openCreate} disabled={!canWrite} />

      {/* ── Create / Edit modal ─────────────────────────────────── */}
      <FormModal
        open={isModalOpen}
        onClose={closeModal}
        title={editExtra ? t("org.extras.edit") : t("org.extras.create")}
        submitLabel={t("org.actions.save")}
        onSubmit={handleSubmit}
      >
        <Input
          label={t("org.extras.name")}
          value={form.name}
          onChangeText={setField("name")}
        />
        <Input
          label={t("org.extras.price")}
          value={form.price}
          onChangeText={setField("price")}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
      </FormModal>

      {/* ── Delete confirmation ─────────────────────────────────── */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={t("org.extras.deleteTitle")}
        description={t("org.extras.deleteDescription", {
          name: pendingDelete?.name ?? "",
        })}
        confirmLabel={t("org.actions.delete")}
        cancelLabel={t("org.actions.cancel")}
        destructive
        onConfirm={handleDelete}
      />

      {/* ── Restore confirmation ────────────────────────────────── */}
      <ConfirmDialog
        open={pendingRestore !== null}
        onOpenChange={(v) => !v && setPendingRestore(null)}
        title={t("org.extras.restoreTitle")}
        description={t("org.extras.restoreDescription", {
          name: pendingRestore?.name ?? "",
        })}
        confirmLabel={t("org.extras.restore")}
        cancelLabel={t("org.actions.cancel")}
        onConfirm={handleRestore}
      />
    </OrgShell>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  bar: {
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
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
  },
  rowBody: { flex: 1 },
  rowRight: { alignItems: "flex-end", gap: 4 },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pageBtn: { padding: spacing.sm },
});
