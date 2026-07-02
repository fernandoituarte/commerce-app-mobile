import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { Extra, Ingredient, Product } from "@/features/products/product/types";

export interface AddItemModalConfig {
  quantity: number;
  selectedExtras: Extra[];
  removedIngredients: Ingredient[];
}

interface AddItemModalProps {
  product: Product | null;
  open: boolean;
  /** "add" (default) → POST new item; "edit" → PATCH existing item pre-filled */
  mode?: "add" | "edit";
  /** Edit mode: pre-select these product extra IDs */
  initialExtraIds?: ReadonlySet<string>;
  /** Edit mode: pre-select these product ingredient IDs for removal */
  initialRemovedIngredientIds?: ReadonlySet<string>;
  /** Edit mode: pre-set quantity */
  initialQuantity?: number;
  onClose: () => void;
  onConfirm: (config: AddItemModalConfig) => void;
  isPending: boolean;
}

export function AddItemModal({
  product,
  open,
  mode = "add",
  initialExtraIds,
  initialRemovedIngredientIds,
  initialQuantity,
  onClose,
  onConfirm,
  isPending,
}: AddItemModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [quantity, setQuantity] = useState(1);
  const [selectedExtraIds, setSelectedExtraIds] = useState<ReadonlySet<string>>(new Set());
  const [removedIngredientIds, setRemovedIngredientIds] = useState<ReadonlySet<string>>(new Set());

  // Reset (or prefill) selection each time the modal opens.
  useEffect(() => {
    if (open) {
      if (mode === "edit") {
        setQuantity(initialQuantity ?? 1);
        setSelectedExtraIds(new Set(initialExtraIds));
        setRemovedIngredientIds(new Set(initialRemovedIngredientIds));
      } else {
        setQuantity(1);
        setSelectedExtraIds(new Set());
        setRemovedIngredientIds(new Set());
      }
    }
  }, [open, product?.id]);

  if (!product) return null;

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleRemoveIngredient = (id: string) => {
    setRemovedIngredientIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedExtras = product.extras.filter((e) => selectedExtraIds.has(e.id));
  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const lineTotal = (product.price + extrasTotal) * quantity;

  const confirmKey = mode === "edit" ? "pos.addItem.modal.confirmEdit" : "pos.addItem.modal.confirm";

  const handleConfirm = () => {
    onConfirm({
      quantity,
      selectedExtras,
      removedIngredients: product.ingredients.filter((i) => removedIngredientIds.has(i.id)),
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={product.name}
      submitLabel={`${t(confirmKey)}  ·  $${lineTotal.toFixed(2)}`}
      onSubmit={handleConfirm}
      submitLoading={isPending}
    >
      {/* ── Quantity ──────────────────────────────────────────── */}
      <View style={styles.section}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          {t("pos.addItem.modal.quantity").toUpperCase()}
        </Text>
        <View style={styles.qtyRow}>
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            hitSlop={10}
            style={[styles.qtyBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Ionicons name="remove" size={18} color={theme.text} />
          </Pressable>
          <Text style={[typography.h2, { color: theme.text, minWidth: 40, textAlign: "center" }]}>
            {quantity}
          </Text>
          <Pressable
            onPress={() => setQuantity((q) => q + 1)}
            hitSlop={10}
            style={[styles.qtyBtn, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Ionicons name="add" size={18} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* ── Extras ────────────────────────────────────────────── */}
      {product.extras.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.sm }]}>
            {t("pos.addItem.modal.extras").toUpperCase()}
          </Text>
          {product.extras.map((extra) => {
            const active = selectedExtraIds.has(extra.id);
            return (
              <Pressable
                key={extra.id}
                onPress={() => toggleExtra(extra.id)}
                style={({ pressed }) => [
                  styles.optionRow,
                  { borderColor: active ? theme.primary : theme.border },
                  active && { backgroundColor: theme.primarySoft },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Ionicons
                  name={active ? "checkmark-circle" : "add-circle-outline"}
                  size={20}
                  color={active ? theme.primary : theme.textMuted}
                />
                <Text style={[typography.body, { color: theme.text, flex: 1, marginLeft: spacing.sm }]}>
                  {extra.name}
                </Text>
                <Text style={[typography.bodySm, { color: theme.primary, fontWeight: "600" }]}>
                  +${extra.price.toFixed(2)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Remove ingredients ────────────────────────────────── */}
      {product.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.sm }]}>
            {t("pos.addItem.modal.ingredients").toUpperCase()}
          </Text>
          {product.ingredients.map((ingredient) => {
            const removing = removedIngredientIds.has(ingredient.id);
            return (
              <Pressable
                key={ingredient.id}
                onPress={() => toggleRemoveIngredient(ingredient.id)}
                style={({ pressed }) => [
                  styles.optionRow,
                  { borderColor: removing ? theme.danger : theme.border },
                  removing && { backgroundColor: theme.dangerSoft },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <Ionicons
                  name={removing ? "close-circle" : "remove-circle-outline"}
                  size={20}
                  color={removing ? theme.danger : theme.textMuted}
                />
                <Text
                  style={[
                    typography.body,
                    { color: removing ? theme.textMuted : theme.text, flex: 1, marginLeft: spacing.sm },
                    removing && { textDecorationLine: "line-through" },
                  ]}
                >
                  {ingredient.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: spacing.md },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.xs,
  },
});
