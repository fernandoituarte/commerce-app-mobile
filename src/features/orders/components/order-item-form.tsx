import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useGetProducts } from "@/features/products/product/hooks";
import type { Product } from "@/features/products/product/types";
import type { CreateOrderItemExtraDto, CreateOrderItemRemovedIngredientDto } from "@/features/orders/types";

export interface OrderItemValue {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  extras: CreateOrderItemExtraDto[];
  removedIngredients: CreateOrderItemRemovedIngredientDto[];
  _product: Product | null;
}

interface OrderItemFormProps {
  index: number;
  item: OrderItemValue;
  onChange: (item: OrderItemValue) => void;
  onRemove: () => void;
}

export function OrderItemForm({ index, item, onChange, onRemove }: OrderItemFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [searchActive, setSearchActive] = useState(!item.productId);

  const { data } = useGetProducts({ search: search || undefined, limit: 5 });
  const results = data?.items ?? [];

  const handleSelect = (p: Product) => {
    setSearch("");
    setSearchActive(false);
    onChange({ ...item, productId: p.id, name: p.name, unitPrice: p.price, extras: [], removedIngredients: [], _product: p });
  };

  const toggleExtra = (e: Product["extras"][0]) => {
    const idx = item.extras.findIndex((x) => x.extraId === e.id);
    const next =
      idx >= 0
        ? item.extras.filter((_, i) => i !== idx)
        : [...item.extras, { extraId: e.id, name: e.name, price: e.price, quantity: 1 }];
    onChange({ ...item, extras: next });
  };

  const toggleIngredient = (ing: Product["ingredients"][0]) => {
    const idx = item.removedIngredients.findIndex((x) => x.ingredientId === ing.id);
    const next =
      idx >= 0
        ? item.removedIngredients.filter((_, i) => i !== idx)
        : [...item.removedIngredients, { ingredientId: ing.id, ingredientName: ing.name }];
    onChange({ ...item, removedIngredients: next });
  };

  return (
    <View style={[styles.wrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>
          {t("org.orders.product")} {index + 1}
        </Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="trash-outline" size={16} color={theme.danger} />
        </Pressable>
      </View>

      {searchActive ? (
        <View>
          <Input
            value={search}
            onChangeText={setSearch}
            placeholder={t("org.orders.productPlaceholder")}
          />
          <View style={[styles.results, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
            {results.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => handleSelect(p)}
                style={({ pressed }) => [
                  styles.resultRow,
                  { borderBottomColor: theme.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[typography.body, { color: theme.text, flex: 1 }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[typography.bodySm, { color: theme.primary }]}>
                  ${p.price.toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Pressable
          onPress={() => setSearchActive(true)}
          style={[styles.productChip, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}
        >
          <Ionicons name="cube-outline" size={14} color={theme.primary} />
          <Text style={[typography.bodySm, { color: theme.primary, flex: 1 }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[typography.caption, { color: theme.primary }]}>
            ${item.unitPrice.toFixed(2)}
          </Text>
        </Pressable>
      )}

      {item.productId ? (
        <Input
          label={t("org.orders.quantity")}
          value={String(item.quantity)}
          onChangeText={(v) => onChange({ ...item, quantity: Math.max(1, parseInt(v, 10) || 1) })}
          keyboardType="number-pad"
          placeholder="1"
        />
      ) : null}

      {item._product && item._product.extras.length > 0 && (
        <View>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs }]}>
            {t("org.orders.extras").toUpperCase()}
          </Text>
          <View style={styles.chips}>
            {item._product.extras.map((e) => {
              const sel = item.extras.some((x) => x.extraId === e.id);
              return (
                <Pressable
                  key={e.id}
                  onPress={() => toggleExtra(e)}
                  style={[styles.chip, { backgroundColor: sel ? theme.primarySoft : theme.surfaceAlt, borderColor: sel ? theme.primary : theme.border }]}
                >
                  <Text style={[typography.caption, { color: sel ? theme.primary : theme.text }]}>
                    {e.name} +${e.price.toFixed(2)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {item._product && item._product.ingredients.length > 0 && (
        <View>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs }]}>
            {t("org.orders.removedIngredients").toUpperCase()}
          </Text>
          <View style={styles.chips}>
            {item._product.ingredients.map((ing) => {
              const removed = item.removedIngredients.some((x) => x.ingredientId === ing.id);
              return (
                <Pressable
                  key={ing.id}
                  onPress={() => toggleIngredient(ing)}
                  style={[styles.chip, { backgroundColor: removed ? theme.dangerSoft : theme.surfaceAlt, borderColor: removed ? theme.danger : theme.border }]}
                >
                  {removed && <Ionicons name="close" size={11} color={theme.danger} />}
                  <Text style={[typography.caption, { color: removed ? theme.danger : theme.text }]}>
                    {ing.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: spacing.md, gap: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  results: { borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth },
  resultRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  productChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, padding: spacing.sm, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth },
});
