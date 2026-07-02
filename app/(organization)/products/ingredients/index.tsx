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
  useCreateIngredient,
  useDeleteIngredient,
  useGetIngredients,
  useRestoreIngredient,
  useUpdateIngredient,
} from "@/features/products/ingredients/hooks";
import type { Ingredient } from "@/features/products/ingredients/types";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";

// ─── Constants ────────────────────────────────────────────────────

const DEFAULT_FORM = {
  name: "",
};

const LIMIT = 20;

// ─── Screen ───────────────────────────────────────────────────────

export default function IngredientsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Ingredient | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Ingredient | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setPage(1);
  }, [query, withDeleted]);

  const { data, isLoading } = useGetIngredients({
    search: query || undefined,
    withDeleted,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient(editIngredient?.id ?? "");
  const deleteMutation = useDeleteIngredient();
  const restoreMutation = useRestoreIngredient();

  const setField =
    <K extends keyof typeof DEFAULT_FORM>(key: K) =>
    (value: (typeof DEFAULT_FORM)[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setCreateOpen(true);
  };

  const openEdit = (ingredient: Ingredient) => {
    setForm({
      name: ingredient.name,
    });
    setEditIngredient(ingredient);
  };

  const closeModal = () => {
    setCreateOpen(false);
    setEditIngredient(null);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
    };
    if (editIngredient) {
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

  const isModalOpen = createOpen || editIngredient !== null;

  return (
    <OrgShell
      title={t("org.ingredients.title")}
      scrollable={false}
      padded={false}
    >
      {/* ── Search + deleted toggle ─────────────────────────────── */}
      <View style={[styles.bar, { borderBottomColor: theme.border }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t("org.ingredients.search")}
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
            {t("org.ingredients.showDeleted")}
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
                  name="leaf-outline"
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

              {/* Status badge */}
              <Badge
                label={
                  item.isActive
                    ? t("org.ingredients.active")
                    : t("org.ingredients.inactive")
                }
                tone={item.isActive ? "success" : "neutral"}
              />

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
          icon="leaf-outline"
          title={t("org.ingredients.empty")}
          description={t("org.ingredients.emptyDescription")}
          actionLabel={t("org.ingredients.create")}
          onAction={openCreate}
        />
      ) : null}

      <FloatingAction onPress={openCreate} disabled={!canWrite} />

      {/* ── Create / Edit modal ─────────────────────────────────── */}
      <FormModal
        open={isModalOpen}
        onClose={closeModal}
        title={
          editIngredient
            ? t("org.ingredients.edit")
            : t("org.ingredients.create")
        }
        submitLabel={t("org.actions.save")}
        onSubmit={handleSubmit}
      >
        <Input
          label={t("org.ingredients.name")}
          value={form.name}
          onChangeText={setField("name")}
        />
      </FormModal>

      {/* ── Delete confirmation ─────────────────────────────────── */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={t("org.ingredients.deleteTitle")}
        description={t("org.ingredients.deleteDescription", {
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
        title={t("org.ingredients.restoreTitle")}
        description={t("org.ingredients.restoreDescription", {
          name: pendingRestore?.name ?? "",
        })}
        confirmLabel={t("org.ingredients.restore")}
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
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pageBtn: { padding: spacing.sm },
});
