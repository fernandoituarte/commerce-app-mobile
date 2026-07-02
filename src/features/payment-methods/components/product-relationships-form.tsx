import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FormModal, SearchBar } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useGetCategories } from "@/features/products/category/hooks";
import { useGetTags } from "@/features/products/tags/hooks";
import { useGetExtras } from "@/features/products/extras/hooks";

interface ProductRelationshipsFormProps {
  categoryId: string;
  tagIds: string[];
  extraIds: string[];
  onCategoryChange: (id: string) => void;
  onTagsChange: (ids: string[]) => void;
  onExtrasChange: (ids: string[]) => void;
}

type Picker = "category" | "tags" | "extras" | null;

export function ProductRelationshipsForm({
  categoryId, tagIds, extraIds,
  onCategoryChange, onTagsChange, onExtrasChange,
}: ProductRelationshipsFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [openPicker, setOpenPicker] = useState<Picker>(null);
  const [search, setSearch] = useState("");

  const { data: cats } = useGetCategories({ limit: 100 });
  const { data: tags } = useGetTags({ limit: 100 });
  const { data: extras } = useGetExtras({ limit: 100 });

  const lc = search.toLowerCase();
  const filteredCats = cats?.items.filter((c) => c.name.toLowerCase().includes(lc));
  const filteredTags = tags?.items.filter((t) => t.name.toLowerCase().includes(lc));
  const filteredExtras = extras?.items.filter((e) => e.name.toLowerCase().includes(lc));

  const selectedCatName = cats?.items.find((c) => c.id === categoryId)?.name ?? "";

  const open = (p: Picker) => { setSearch(""); setOpenPicker(p); };
  const close = () => { setOpenPicker(null); setSearch(""); };

  const toggleTag = (id: string) =>
    onTagsChange(tagIds.includes(id) ? tagIds.filter((x) => x !== id) : [...tagIds, id]);
  const toggleExtra = (id: string) =>
    onExtrasChange(extraIds.includes(id) ? extraIds.filter((x) => x !== id) : [...extraIds, id]);

  return (
    <>
      {/* Category */}
      <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm }]}>
        {t("org.products.category")}
      </Text>
      <Pressable
        onPress={() => open("category")}
        style={[styles.selectBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={[typography.body, { color: selectedCatName ? theme.text : theme.textMuted, flex: 1 }]} numberOfLines={1}>
          {selectedCatName || t("org.products.selectCategory")}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />
      </Pressable>

      {/* Tags */}
      <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm, marginTop: spacing.xs }]}>
        {t("org.products.tags")}
      </Text>
      <View style={styles.chipsRow}>
        {tagIds.map((id) => {
          const tag = tags?.items.find((tg) => tg.id === id);
          return tag ? (
            <Pressable key={id} onPress={() => toggleTag(id)} style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
              <Text style={[typography.caption, { color: theme.primary }]}>{tag.name}</Text>
              <Ionicons name="close" size={12} color={theme.primary} />
            </Pressable>
          ) : null;
        })}
        <Pressable onPress={() => open("tags")} style={[styles.addChip, { borderColor: theme.border }]}>
          <Ionicons name="add" size={14} color={theme.primary} />
          <Text style={[typography.caption, { color: theme.primary }]}>{t("org.products.addTag")}</Text>
        </Pressable>
      </View>

      {/* Extras */}
      <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm, marginTop: spacing.xs }]}>
        {t("org.products.extras")}
      </Text>
      <View style={styles.chipsRow}>
        {extraIds.map((id) => {
          const extra = extras?.items.find((e) => e.id === id);
          return extra ? (
            <Pressable key={id} onPress={() => toggleExtra(id)} style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
              <Text style={[typography.caption, { color: theme.primary }]}>{extra.name}</Text>
              <Ionicons name="close" size={12} color={theme.primary} />
            </Pressable>
          ) : null;
        })}
        <Pressable onPress={() => open("extras")} style={[styles.addChip, { borderColor: theme.border }]}>
          <Ionicons name="add" size={14} color={theme.primary} />
          <Text style={[typography.caption, { color: theme.primary }]}>{t("org.products.addExtra")}</Text>
        </Pressable>
      </View>

      {/* Category picker */}
      <FormModal open={openPicker === "category"} onClose={close} title={t("org.products.category")} submitLabel={t("org.products.done")} onSubmit={close}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t("org.products.search")} />
        <View style={{ marginTop: spacing.sm }}>
          <Pressable onPress={() => { onCategoryChange(""); close(); }} style={[styles.row, { borderColor: theme.border }, !categoryId && { backgroundColor: theme.primarySoft }]}>
            <Text style={[typography.body, { color: !categoryId ? theme.primary : theme.text, flex: 1 }]}>{t("org.products.noCategory")}</Text>
            {!categoryId && <Ionicons name="checkmark" size={18} color={theme.primary} />}
          </Pressable>
          {filteredCats?.map((c) => (
            <Pressable key={c.id} onPress={() => { onCategoryChange(c.id); close(); }} style={[styles.row, { borderColor: theme.border }, categoryId === c.id && { backgroundColor: theme.primarySoft }]}>
              <Text style={[typography.body, { color: categoryId === c.id ? theme.primary : theme.text, flex: 1 }]}>{c.name}</Text>
              {categoryId === c.id && <Ionicons name="checkmark" size={18} color={theme.primary} />}
            </Pressable>
          ))}
        </View>
      </FormModal>

      {/* Tags picker */}
      <FormModal open={openPicker === "tags"} onClose={close} title={t("org.products.tags")} submitLabel={t("org.products.done")} onSubmit={close}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t("org.products.search")} />
        <View style={{ marginTop: spacing.sm }}>
          {filteredTags?.map((tg) => {
            const sel = tagIds.includes(tg.id);
            return (
              <Pressable key={tg.id} onPress={() => toggleTag(tg.id)} style={[styles.row, { borderColor: theme.border }, sel && { backgroundColor: theme.primarySoft }]}>
                <Text style={[typography.body, { color: sel ? theme.primary : theme.text, flex: 1 }]}>{tg.name}</Text>
                {sel && <Ionicons name="checkmark" size={18} color={theme.primary} />}
              </Pressable>
            );
          })}
        </View>
      </FormModal>

      {/* Extras picker */}
      <FormModal open={openPicker === "extras"} onClose={close} title={t("org.products.extras")} submitLabel={t("org.products.done")} onSubmit={close}>
        <SearchBar value={search} onChangeText={setSearch} placeholder={t("org.products.search")} />
        <View style={{ marginTop: spacing.sm }}>
          {filteredExtras?.map((ex) => {
            const sel = extraIds.includes(ex.id);
            return (
              <Pressable key={ex.id} onPress={() => toggleExtra(ex.id)} style={[styles.row, { borderColor: theme.border }, sel && { backgroundColor: theme.primarySoft }]}>
                <Text style={[typography.body, { color: sel ? theme.primary : theme.text, flex: 1 }]}>{ex.name}</Text>
                <Text style={[typography.bodySm, { color: theme.textMuted, marginRight: spacing.sm }]}>+${Number(ex.price ?? 0).toFixed(2)}</Text>
                {sel && <Ionicons name="checkmark" size={18} color={theme.primary} />}
              </Pressable>
            );
          })}
        </View>
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  selectBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.md },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill },
  addChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, marginBottom: spacing.sm },
});
