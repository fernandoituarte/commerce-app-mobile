import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useUpdateOrder } from "@/features/orders/hooks";
import { OrderStatusBadge } from "./order-status-badge";

const ORDER_STATUSES = ["PENDING", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED", "REOPENED"];

interface UpdateOrderStatusDialogProps {
  orderId: string | null;
  currentStatus: string;
  onClose: () => void;
}

export function UpdateOrderStatusDialog({
  orderId,
  currentStatus,
  onClose,
}: UpdateOrderStatusDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selected, setSelected] = useState(currentStatus);
  const mutation = useUpdateOrder(orderId ?? "");

  useEffect(() => {
    if (orderId !== null) setSelected(currentStatus);
  }, [orderId]);

  const handleSubmit = () => {
    if (!orderId) return;
    if (selected === currentStatus) { onClose(); return; }
    mutation.mutate({ status: selected }, { onSuccess: onClose });
  };

  return (
    <FormModal
      open={orderId !== null}
      onClose={onClose}
      title={t("org.orders.updateStatus.title")}
      submitLabel={t("org.orders.updateStatus.confirm")}
      onSubmit={handleSubmit}
    >
      <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.sm }]}>
        {t("org.orders.updateStatus.label")}
      </Text>
      <View style={styles.options}>
        {ORDER_STATUSES.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSelected(s)}
            style={[
              styles.option,
              {
                borderColor: s === selected ? theme.primary : theme.border,
                backgroundColor: s === selected ? theme.primarySoft : theme.surface,
              },
            ]}
          >
            <OrderStatusBadge status={s} />
            {s === selected && (
              <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
            )}
          </Pressable>
        ))}
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
