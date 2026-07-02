import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { mediaService } from "@/features/media/api/media.service";
import {
  DEFAULT_FORM,
  ProductFormValues,
  buildProductPayload,
  mapProductToForm,
} from "../helpers/product.helpers";
import type { Product } from "../types";
import { ProductImageUploader } from "./product-image-uploader";
import { ProductRelationshipsForm } from "./product-relationships-form";
import { ProductIngredientsInput } from "./product-ingredients-input";
import { ProductUIForm } from "./product-ui-form";
import { ProductCardPreview } from "./product-card-preview";
import { useGetCategories } from "@/features/products/category/hooks";

export interface ProductFormRef {
  submit: () => void;
  cancel: () => void;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  originalImageKey: string;
  onSubmit: (payload: ReturnType<typeof buildProductPayload>) => void;
  onCancel: () => void;
}

export const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(
  function ProductForm({ initialValues, originalImageKey, onSubmit, onCancel }, ref) {
    const { t } = useTranslation();
    const theme = useTheme();
    const [form, setForm] = useState<ProductFormValues>(initialValues ?? DEFAULT_FORM);
    const formRef = useRef(form);
    formRef.current = form;

    const { data: cats } = useGetCategories({ limit: 100 });
    const selectedCatName = cats?.items.find((c) => c.id === form.categoryId)?.name ?? "";

    const set = <K extends keyof ProductFormValues>(k: K) => (v: ProductFormValues[K]) =>
      setForm((f) => ({ ...f, [k]: v }));

    useImperativeHandle(ref, () => ({
      submit: () => {
        onSubmit(buildProductPayload(formRef.current));
      },
      cancel: () => {
        const f = formRef.current;
        if (f.imageKey && f.imageKey !== originalImageKey) {
          mediaService.delete(f.imageKey).catch(() => {});
        }
        onCancel();
      },
    }));

    return (
      <>
        <Input label={t("org.products.name")} value={form.name} onChangeText={set("name")} />
        <Input label={t("org.products.description")} value={form.description} onChangeText={set("description")} multiline numberOfLines={2} />

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Input label={t("org.products.price")} value={form.price} onChangeText={set("price")} keyboardType="decimal-pad" placeholder="0.00" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label={t("org.products.stock")} value={form.stock} onChangeText={set("stock")} keyboardType="number-pad" placeholder="0" />
          </View>
        </View>

        {/* Track stock toggle */}
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

        {form.trackStock && (
          <>
            <Input
              label={t("org.products.reservedStock")}
              value={form.reservedStock}
              onChangeText={set("reservedStock")}
              keyboardType="number-pad"
              placeholder="0"
            />
            <Input
              label={t("org.products.lowStockThreshold")}
              value={form.lowStockThreshold}
              onChangeText={set("lowStockThreshold")}
              keyboardType="number-pad"
              placeholder="0"
            />
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: -spacing.sm, marginBottom: spacing.md }]}>
              {t("org.products.lowStockThresholdHint")}
            </Text>
          </>
        )}

        <View style={styles.toggleRow}>
          <Text style={[typography.body, { color: theme.text }]}>{t("org.products.availability")}</Text>
          <Pressable
            onPress={() => set("availability")(form.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE")}
            style={[
              styles.availChip,
              form.availability === "AVAILABLE"
                ? { backgroundColor: theme.primarySoft, borderColor: theme.primary }
                : { backgroundColor: theme.dangerSoft, borderColor: theme.danger },
            ]}
          >
            <Text style={[typography.caption, { fontWeight: "600", color: form.availability === "AVAILABLE" ? theme.primary : theme.danger }]}>
              {form.availability === "AVAILABLE" ? t("org.products.available") : t("org.products.unavailable")}
            </Text>
          </Pressable>
        </View>

        <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm }]}>
          {t("org.products.image")}
        </Text>
        <ProductImageUploader
          imageUrl={form.imageUrl}
          imageKey={form.imageKey}
          onImageChange={(url, key) => setForm((f) => ({ ...f, imageUrl: url, imageKey: key }))}
        />

        <ProductRelationshipsForm
          categoryId={form.categoryId}
          tagIds={form.tagIds}
          extraIds={form.extraIds}
          onCategoryChange={set("categoryId")}
          onTagsChange={set("tagIds")}
          onExtrasChange={set("extraIds")}
        />

        <ProductIngredientsInput
          lines={form.ingredientLines}
          onChange={set("ingredientLines")}
        />

        <ProductUIForm
          backgroundColor={form.backgroundColor}
          textColor={form.textColor}
          badge={form.badge}
          highlight={form.highlight}
          sortOrder={form.sortOrder}
          onBgColorChange={set("backgroundColor")}
          onTextColorChange={set("textColor")}
          onBadgeChange={set("badge")}
          onHighlightChange={set("highlight")}
          onSortOrderChange={set("sortOrder")}
        />

        <Text style={[typography.bodySm, { color: theme.textMuted, marginBottom: spacing.sm, marginTop: spacing.xs }]}>
          {t("org.products.preview")}
        </Text>
        <ProductCardPreview
          name={form.name}
          price={form.price}
          imageUrl={form.imageUrl}
          badge={form.badge}
          backgroundColor={form.backgroundColor}
          textColor={form.textColor}
          highlight={form.highlight}
          categoryName={selectedCatName}
        />
      </>
    );
  },
);

const styles = StyleSheet.create({
  row2: { flexDirection: "row", gap: spacing.sm },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  toggleLabel: { flex: 1, gap: 2, paddingRight: spacing.md },
  availChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
});
