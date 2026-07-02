import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { FormModal, Input } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useCreateOrder } from "@/features/orders/hooks";
import { OrderItemForm, type OrderItemValue } from "./order-item-form";

type ItemWithKey = OrderItemValue & { _key: number };

const EMPTY_ITEM: OrderItemValue = {
  productId: "",
  name: "",
  unitPrice: 0,
  quantity: 1,
  extras: [],
  removedIngredients: [],
  _product: null,
};

interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrderModal({ open, onClose }: CreateOrderModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const mutation = useCreateOrder();
  const nextKey = useRef(1);

  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<ItemWithKey[]>([{ ...EMPTY_ITEM, _key: 0 }]);
  const [error, setError] = useState("");

  const subtotal = items.reduce((sum, it) => {
    if (!it.productId) return sum;
    const extrasSum = it.extras.reduce((es, e) => es + e.price * e.quantity, 0);
    return sum + (it.unitPrice + extrasSum) * it.quantity;
  }, 0);

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM, _key: nextKey.current++ }]);
  };

  const updateItem = (key: number, val: OrderItemValue) =>
    setItems((prev) => prev.map((it) => (it._key === key ? { ...val, _key: key } : it)));

  const removeItem = (key: number) =>
    setItems((prev) => prev.filter((it) => it._key !== key));

  const handleClose = () => {
    setCustomerName("");
    setItems([{ ...EMPTY_ITEM, _key: 0 }]);
    nextKey.current = 1;
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const valid = items.filter((it) => it.productId);
    if (valid.length === 0) {
      setError(t("org.orders.minOneItem"));
      return;
    }
    setError("");
    mutation.mutate(
      {
        customerName: customerName.trim() || undefined,
        items: valid.map((it) => ({
          productId: it.productId,
          name: it.name,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          extras: it.extras.length ? it.extras : undefined,
          removedIngredients: it.removedIngredients.length ? it.removedIngredients : undefined,
        })),
      },
      {
        onSuccess: (order) => {
          handleClose();
          router.push(`/(organization)/sales/orders/${order.id}`);
        },
      },
    );
  };

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("org.orders.create")}
      submitLabel={t("org.actions.create")}
      onSubmit={handleSubmit}
    >
      <Input
        label={t("org.orders.customerName")}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder={t("org.orders.customerNamePlaceholder")}
      />

      {items.map((item) => (
        <OrderItemForm
          key={item._key}
          index={items.indexOf(item)}
          item={item}
          onChange={(v) => updateItem(item._key, v)}
          onRemove={() => removeItem(item._key)}
        />
      ))}

      <Pressable
        onPress={addItem}
        style={({ pressed }) => [
          styles.addBtn,
          { borderColor: theme.primary },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Ionicons name="add" size={16} color={theme.primary} />
        <Text style={[typography.bodySm, { color: theme.primary }]}>
          {t("org.orders.addItem")}
        </Text>
      </Pressable>

      {error ? (
        <Text style={[typography.caption, { color: theme.danger }]}>{error}</Text>
      ) : null}

      <View style={[styles.summary, { borderTopColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[typography.body, { color: theme.textMuted }]}>{t("org.orders.subtotal")}</Text>
          <Text style={[typography.body, { color: theme.text }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[typography.h3, { color: theme.text }]}>{t("org.orders.total")}</Text>
          <Text style={[typography.h3, { color: theme.text }]}>${subtotal.toFixed(2)}</Text>
        </View>
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    alignSelf: "flex-start",
  },
  summary: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
