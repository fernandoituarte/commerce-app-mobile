import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { FormModal, Input } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { useUpdateProduct } from "../hooks";
import type { Product } from "../types";

interface EditStockModalProps {
  product: Product | null;
  onClose: () => void;
}

interface StockForm {
  stock: string;
  reservedStock: string;
  lowStockThreshold: string;
  trackStock: boolean;
}

function toForm(p: Product): StockForm {
  return {
    stock: String(p.stock ?? 0),
    reservedStock: p.reservedStock != null ? String(p.reservedStock) : "",
    lowStockThreshold: p.lowStockThreshold != null ? String(p.lowStockThreshold) : "",
    trackStock: p.trackStock ?? false,
  };
}

export function EditStockModal({ product, onClose }: EditStockModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const mutation = useUpdateProduct(product?.id ?? "");

  const [form, setForm] = useState<StockForm>(
    product ? toForm(product) : { stock: "0", reservedStock: "", lowStockThreshold: "", trackStock: false }
  );

  useEffect(() => {
    if (product) setForm(toForm(product));
  }, [product?.id]);

  const set = <K extends keyof StockForm>(k: K) => (v: StockForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!product) return;
    mutation.mutate(
      {
        stock: parseInt(form.stock, 10) || 0,
        reservedStock: form.reservedStock ? parseInt(form.reservedStock, 10) : undefined,
        lowStockThreshold: form.lowStockThreshold ? parseInt(form.lowStockThreshold, 10) : undefined,
        trackStock: form.trackStock,
      } as any,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
          onClose();
        },
      }
    );
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
          <Text style={[typography.body, { color: theme.text }]}>{t("org.products.trackStock")}</Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>{t("org.products.trackStockHint")}</Text>
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
