import React, { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
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
  useCreateTag,
  useDeleteTag,
  useGetTags,
  useRestoreTag,
  useUpdateTag,
} from "@/features/products/tags/hooks";
import type { Tag } from "@/features/products/tags/types";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";

// ─── Constants ────────────────────────────────────────────────────

const BG_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#92400e",
];

const TEXT_COLORS = [
  "#ffffff",
  "#0f172a",
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#7c3aed",
];

const DEFAULT_FORM = {
  name: "",
  backgroundColor: BG_COLORS[0],
  textColor: TEXT_COLORS[0],
  badge: "",
  highlight: false,
  sortOrder: 0,
};

const LIMIT = 20;

// ─── Screen ───────────────────────────────────────────────────────

export default function TagsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Tag | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    setPage(1);
  }, [query, withDeleted]);

  const { data, isLoading } = useGetTags({
    search: query || undefined,
    withDeleted,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag(editTag?.id ?? "");
  const deleteMutation = useDeleteTag();
  const restoreMutation = useRestoreTag();

  const setField =
    <K extends keyof typeof DEFAULT_FORM>(key: K) =>
    (value: (typeof DEFAULT_FORM)[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const openCreate = () => {
    setForm(DEFAULT_FORM);
    setCreateOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setForm({
      name: tag.name,
      backgroundColor: tag.ui?.backgroundColor || BG_COLORS[0],
      textColor: tag.ui?.textColor || TEXT_COLORS[0],
      badge: tag.ui?.badge ?? "",
      highlight: tag.ui?.highlight ?? false,
      sortOrder: tag.ui?.sortOrder ?? 0,
    });
    setEditTag(tag);
  };

  const closeModal = () => {
    setCreateOpen(false);
    setEditTag(null);
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      ui: {
        backgroundColor: form.backgroundColor,
        textColor: form.textColor,
        badge: form.badge,
        highlight: form.highlight,
        sortOrder: Number(form.sortOrder),
      },
    };
    if (editTag) {
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

  const isModalOpen = createOpen || editTag !== null;

  return (
    <OrgShell
      title={t("org.tags.title")}
      scrollable={false}
      padded={false}
    >
      {/* ── Search + deleted toggle ─────────────────────────────── */}
      <View style={[styles.bar, { borderBottomColor: theme.border }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t("org.tags.search")}
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
            {t("org.tags.showDeleted")}
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
              {/* Color swatch */}
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor:
                      item.ui?.backgroundColor || theme.primarySoft,
                  },
                ]}
              />

              {/* Info */}
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text
                    style={[typography.body, { color: theme.text, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.ui?.badge ? (
                    <View
                      style={[
                        styles.badgeChip,
                        { backgroundColor: item.ui.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          typography.caption,
                          { color: item.ui.textColor || "#fff" },
                        ]}
                      >
                        {item.ui.badge}
                      </Text>
                    </View>
                  ) : null}
                  <Badge
                    label={
                      item.isActive
                        ? t("org.tags.active")
                        : t("org.tags.inactive")
                    }
                    tone={item.isActive ? "success" : "neutral"}
                  />
                </View>
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
          icon="pricetag-outline"
          title={t("org.tags.empty")}
          description={t("org.tags.emptyDescription")}
          actionLabel={t("org.tags.create")}
          onAction={openCreate}
        />
      ) : null}

      <FloatingAction onPress={openCreate} disabled={!canWrite} />

      {/* ── Create / Edit modal ─────────────────────────────────── */}
      <FormModal
        open={isModalOpen}
        onClose={closeModal}
        title={editTag ? t("org.tags.edit") : t("org.tags.create")}
        submitLabel={t("org.actions.save")}
        onSubmit={handleSubmit}
      >
        <Input
          label={t("org.tags.name")}
          value={form.name}
          onChangeText={setField("name")}
        />

        {/* Background color */}
        <Text
          style={[
            typography.bodySm,
            { color: theme.textMuted, marginBottom: spacing.sm },
          ]}
        >
          {t("org.tags.backgroundColor")}
        </Text>
        <View style={styles.colorGrid}>
          {BG_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setField("backgroundColor")(c)}
              style={[
                styles.colorSwatch,
                { backgroundColor: c },
                form.backgroundColor === c && styles.colorSelected,
              ]}
            >
              {form.backgroundColor === c && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Text color */}
        <Text
          style={[
            typography.bodySm,
            { color: theme.textMuted, marginBottom: spacing.sm },
          ]}
        >
          {t("org.tags.textColor")}
        </Text>
        <View style={styles.colorGrid}>
          {TEXT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setField("textColor")(c)}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor: c,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: theme.border,
                },
                form.textColor === c && styles.colorSelected,
              ]}
            >
              {form.textColor === c && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color={c === "#ffffff" ? "#000" : "#fff"}
                />
              )}
            </Pressable>
          ))}
        </View>

        <Input
          label={t("org.tags.badge")}
          value={form.badge}
          onChangeText={setField("badge")}
          placeholder={t("org.tags.badgePlaceholder")}
        />

        {/* Highlight toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <Text style={[typography.body, { color: theme.text }]}>
              {t("org.tags.highlight")}
            </Text>
            <Text style={[typography.caption, { color: theme.textMuted }]}>
              {t("org.tags.highlightHint")}
            </Text>
          </View>
          <Switch
            value={form.highlight}
            onValueChange={setField("highlight")}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <Input
          label={t("org.tags.sortOrder")}
          value={String(form.sortOrder)}
          onChangeText={(v) => setField("sortOrder")(Number(v) || 0)}
          keyboardType="number-pad"
        />

        {/* Live preview */}
        <Text
          style={[
            typography.bodySm,
            {
              color: theme.textMuted,
              marginBottom: spacing.sm,
              marginTop: spacing.xs,
            },
          ]}
        >
          {t("org.tags.preview")}
        </Text>
        <View
          style={[styles.preview, { backgroundColor: form.backgroundColor }]}
        >
          <View style={styles.previewContent}>
            <Text
              style={[typography.h3, { color: form.textColor }]}
              numberOfLines={1}
            >
              {form.name || t("org.tags.name")}
            </Text>
          </View>
          <View style={styles.previewRight}>
            {form.badge ? (
              <View
                style={[
                  styles.previewBadge,
                  { backgroundColor: `${form.textColor}33` },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: form.textColor, fontWeight: "600" },
                  ]}
                >
                  {form.badge}
                </Text>
              </View>
            ) : null}
            {form.highlight ? (
              <Ionicons name="star" size={16} color={form.textColor} />
            ) : null}
          </View>
        </View>
      </FormModal>

      {/* ── Delete confirmation ─────────────────────────────────── */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={t("org.tags.deleteTitle")}
        description={t("org.tags.deleteDescription", {
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
        title={t("org.tags.restoreTitle")}
        description={t("org.tags.restoreDescription", {
          name: pendingRestore?.name ?? "",
        })}
        confirmLabel={t("org.tags.restore")}
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
  swatch: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
  },
  rowBody: { flex: 1 },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  badgeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  pageBtn: { padding: spacing.sm },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  toggleLabel: { flex: 1, gap: 2, paddingRight: spacing.md },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    minHeight: 64,
  },
  previewContent: { flex: 1 },
  previewRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
