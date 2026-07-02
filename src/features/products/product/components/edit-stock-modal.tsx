import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { FormModal, Input } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { useUpdateProduct } from "../hooks";
import type { Product, ProductPayload } from "../types";

interface EditStockModalProps {
  product: Product | null;
  onClose: () => void;
}

interface StockForm {
  stock:              string;
  reservedStock:      string;
  lowStockThreshold:  string;
  trackStock:         boolean;
}

function toForm(p: Product): StockForm {
  return {
    stock:             String(p.stock ?? 0),
    reservedStock:     p.reservedStock != null ? String(p.reservedStock) : "",
    lowStockThreshold: p.lowStockThreshold != null ? String(p.lowStockThreshold) : "",
    trackStock:        p.trackStock ?? true,
  };
}

function buildStockPayload(form: StockForm): Partial<ProductPayload> {
  return {
    stock:     parseInt(form.stock, 10) || 0,
    trackStock: form.trackStock,
    ...(form.reservedStock
      ? { reservedStock: parseInt(form.reservedStock, 10) }
      : { reservedStock: undefined }),
    ...(form.lowStockThreshold
      ? { lowStockThreshold: parseInt(form.lowStockThreshold, 10) }
      : { lowStockThreshold: undefined }),
  };
}

export function EditStockModal({ product, onClose }: EditStockModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const mutation = useUpdateProduct(product?.id ?? "");

  const [form, setForm] = useState<StockForm>(
    product
      ? toForm(product)
      : { stock: "0", reservedStock: "", lowStockThreshold: "", trackStock: true }
  );

  useEffect(() => {
    if (product) setForm(toForm(product));
  }, [product?.id]);

  const set = <K extends keyof StockForm>(k: K) => (v: StockForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!product) return;
    mutation.mutate(buildStockPayload(form) as ProductPayload, {
      onSuccess: onClose, // ← useUpdateProduct ya invalida la lista
    });
  };

  const fieldsDisabled = !form.trackStock;

  return (
    <FormModal
      open={product !== null}
      onClose={onClose}
      title={product?.name ?? ""}
      submitLabel={t("org.actions.save")}
      onSubmit={handleSubmit}
    >
      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={[typography.body, { color: theme.text }]}>
            {t("org.products.trackStock")}
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            {t("org.products.trackStockHint")}
          </Text>
        </View>
        <Switch
          value={form.trackStock}
          onValueChange={set("trackStock")}
          trackColor={{ false: theme.border, true: theme.primary }}
        />
      </View>

      <View style={fieldsDisabled ? styles.dimmed : undefined}>
        <Input
          label={t("org.products.stock")}
          value={form.stock}
          onChangeText={set("stock")}
          keyboardType="number-pad"
          placeholder="0"
          editable={!fieldsDisabled}
        />
        <Input
          label={t("org.products.reservedStock")}
          value={form.reservedStock}
          onChangeText={set("reservedStock")}
          keyboardType="number-pad"
          placeholder="0"
          editable={!fieldsDisabled}
        />
        <Input
          label={t("org.products.lowStockThreshold")}
          value={form.lowStockThreshold}
          onChangeText={set("lowStockThreshold")}
          keyboardType="number-pad"
          placeholder="0"
          editable={!fieldsDisabled}
        />
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: -spacing.sm }]}>
          {t("org.products.lowStockThresholdHint")}
        </Text>
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  toggleLabel: { flex: 1, gap: 2, paddingRight: spacing.md },
  dimmed: { opacity: 0.4 },
});