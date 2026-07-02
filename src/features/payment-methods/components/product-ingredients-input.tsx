import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FormModal, Input, SearchBar } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useGetIngredients } from "@/features/products/ingredients/hooks";
import type { IngredientLine } from "../helpers/product.helpers";

interface ProductIngredientsInputProps {
  lines: IngredientLine[];
  onChange: (lines: IngredientLine[]) => void;
}

export function ProductIngredientsInput({ lines, onChange }: ProductIngredientsInputProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data } = useGetIngredients({ limit: 100 });

  const filtered = data?.items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) &&
      !lines.some((l) => l.ingredientId === i.id),
  );

  const addLine = (id: string, name: string) => {
    onChange([...lines, { ingredientId: id, name, quantity: "1" }]);
    setPickerOpen(false);
    setSearch("");
  };

  const removeLine = (id: string) => onChange(lines.filter((l) => l.ingredientId !== id));

  const updateQty = (id: string, qty: string) =>
    onChange(lines.map((l) => (l.ingredientId === id ? { ...l, quantity: qty } : l)));

  return (
    <>
      <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm }]}>
        {t("org.products.ingredients")}
      </Text>

      {lines.map((line) => (
        <View key={line.ingredientId} style={[styles.row, { borderColor: theme.border }]}>
          <Ionicons name="leaf-outline" size={14} color={theme.primary} />
          <Text style={[typography.bodySm, { color: theme.text, flex: 1 }]} numberOfLines={1}>
            {line.name}
          </Text>
          <Input
            value={line.quantity}
            onChangeText={(v) => updateQty(line.ingredientId, v)}
            keyboardType="number-pad"
            placeholder="1"
            style={styles.qtyInput}
          />
          <Pressable onPress={() => removeLine(line.ingredientId)} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={18} color={theme.danger} />
          </Pressable>
        </View>
      ))}

      <Pressable
        onPress={() => { setSearch(""); setPickerOpen(true); }}
        style={[styles.addBtn, { borderColor: theme.border }]}
      >
        <Ionicons name="add" size={14} color={theme.primary} />
        <Text style={[typography.caption, { color: theme.primary }]}>
          {t("org.products.addIngredient")}
        </Text>
      </Pressable>

      <FormModal
        open={pickerOpen}
        onClose={() => { setPickerOpen(false); setSearch(""); }}
        title={t("org.products.ingredients")}
        submitLabel={t("org.products.done")}
        onSubmit={() => { setPickerOpen(false); setSearch(""); }}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder={t("org.products.search")} />
        <View style={{ marginTop: spacing.sm }}>
          {filtered?.length === 0 ? (
            <Text style={[typography.body, { color: theme.textMuted, textAlign: "center", paddingVertical: spacing.lg }]}>
              {t("org.ingredients.empty")}
            </Text>
          ) : null}
          {filtered?.map((ing) => (
            <Pressable
              key={ing.id}
              onPress={() => addLine(ing.id, ing.name)}
              style={[styles.pickerRow, { borderColor: theme.border }]}
            >
              <Ionicons name="leaf-outline" size={16} color={theme.primary} style={{ marginRight: spacing.xs }} />
              <Text style={[typography.body, { color: theme.text, flex: 1 }]}>{ing.name}</Text>
              <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
            </Pressable>
          ))}
        </View>
      </FormModal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  qtyInput: { width: 56, marginBottom: 0 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: "flex-start",
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
});
