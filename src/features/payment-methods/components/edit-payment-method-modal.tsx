import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { FormModal, Input } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import type { PaymentMethod, UpdatePaymentMethodDto } from "../types";

interface EditPaymentMethodModalProps {
  item: PaymentMethod | null;
  onClose: () => void;
  onSubmit: (data: UpdatePaymentMethodDto) => void;
}

export function EditPaymentMethodModal({
  item,
  onClose,
  onSubmit,
}: EditPaymentMethodModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    isDefault: false,
    sortOrder: 0,
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        description: item.description ?? "",
        isActive: item.isActive,
        isDefault: item.isDefault,
        sortOrder: item.sortOrder,
      });
    }
  }, [item]);

  const setField =
    <K extends keyof typeof form>(key: K) =>
    (value: (typeof form)[K]) =>
      setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    onSubmit({
      name: form.name,
      description: form.description || undefined,
      isActive: form.isActive,
      isDefault: form.isDefault,
      sortOrder: Number(form.sortOrder) || 0,
    });
  };

  return (
    <FormModal
      open={item !== null}
      onClose={onClose}
      title={t("org.payment.edit")}
      submitLabel={t("org.actions.save")}
      onSubmit={handleSubmit}
    >
      <Input
        label={t("org.payment.name")}
        value={form.name}
        onChangeText={setField("name")}
      />
      <Input
        label={t("org.payment.fieldDescription")}
        value={form.description}
        onChangeText={setField("description")}
        placeholder={t("org.payment.descriptionPlaceholder")}
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={[typography.body, { color: theme.text }]}>
            {t("org.payment.isActive")}
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            {t("org.payment.isActiveHint")}
          </Text>
        </View>
        <Switch
          value={form.isActive}
          onValueChange={setField("isActive")}
          trackColor={{ false: theme.border, true: theme.primary }}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Text style={[typography.body, { color: theme.text }]}>
            {t("org.payment.isDefault")}
          </Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            {t("org.payment.isDefaultHint")}
          </Text>
        </View>
        <Switch
          value={form.isDefault}
          onValueChange={setField("isDefault")}
          trackColor={{ false: theme.border, true: theme.primary }}
        />
      </View>

      <Input
        label={t("org.payment.sortOrder")}
        value={String(form.sortOrder)}
        onChangeText={(v) => setField("sortOrder")(Number(v) || 0)}
        keyboardType="number-pad"
      />
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
});
