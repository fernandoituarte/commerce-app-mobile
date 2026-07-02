import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FormModal, Input } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useCreateManualPayment } from "../hooks";
import { useGetPaymentMethods } from "@/features/payment-methods/hooks";
import { Currency } from "../types";
import type { CreateManualPaymentDto } from "../types";

// ─── Constants ────────────────────────────────────────────────────

const CURRENCIES = Object.values(Currency);

const DEFAULT_FORM = {
  orderId: "",
  amount: "",
  currency: Currency.USD,
  paymentMethodId: "",
  paymentMethodName: "",
};

// ─── Component ────────────────────────────────────────────────────

interface CreatePaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePaymentModal({ open, onClose }: CreatePaymentModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const mutation = useCreateManualPayment();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [error, setError] = useState("");

  const { data: methodsData } = useGetPaymentMethods({ limit: 50 });
  const methods = methodsData?.items?.filter((m) => m.isActive) ?? [];

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    const parsed = parseFloat(form.amount);
    if (!form.orderId.trim() || isNaN(parsed) || parsed <= 0 || !form.paymentMethodId) {
      setError(t("org.paymentsPage.form.errorRequired"));
      return;
    }
    setError("");

    const payload: CreateManualPaymentDto = {
      orderId: form.orderId.trim(),
      amount: Math.round(parsed * 100),
      currency: form.currency,
      paymentMethodId: form.paymentMethodId,
      paymentMethodName: form.paymentMethodName,
    };
    mutation.mutate(payload, { onSuccess: handleClose });
  };

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("org.paymentsPage.create")}
      submitLabel={t("org.actions.save")}
      onSubmit={handleSubmit}
    >
      <Input
        label={t("org.paymentsPage.form.orderId")}
        value={form.orderId}
        onChangeText={(v) => setForm((f) => ({ ...f, orderId: v }))}
      />

      <Input
        label={t("org.paymentsPage.form.amount")}
        value={form.amount}
        onChangeText={(v) =>
          setForm((f) => ({ ...f, amount: v.replace(",", ".") }))
        }
        keyboardType="decimal-pad"
        placeholder={t("org.paymentsPage.form.amountPlaceholder")}
      />

      {/* Currency selector */}
      <Text
        style={[
          typography.caption,
          { color: theme.textMuted, marginBottom: spacing.xs },
        ]}
      >
        {t("org.paymentsPage.form.currency").toUpperCase()}
      </Text>
      <View style={[styles.chips, { marginBottom: spacing.md }]}>
        {CURRENCIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setForm((f) => ({ ...f, currency: c }))}
            style={[
              styles.chip,
              {
                borderColor:
                  form.currency === c ? theme.primary : theme.border,
                backgroundColor:
                  form.currency === c ? theme.primarySoft : theme.surface,
              },
            ]}
          >
            <Text
              style={[
                typography.bodySm,
                {
                  color: form.currency === c ? theme.primary : theme.text,
                  fontWeight: form.currency === c ? "600" : "400",
                },
              ]}
            >
              {c.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Payment method selector */}
      <Text
        style={[
          typography.caption,
          { color: theme.textMuted, marginBottom: spacing.xs },
        ]}
      >
        {t("org.paymentsPage.form.paymentMethod").toUpperCase()}
      </Text>
      {methods.length === 0 ? (
        <Text
          style={[
            typography.bodySm,
            { color: theme.textMuted, marginBottom: spacing.md },
          ]}
        >
          {t("org.paymentsPage.form.noMethods")}
        </Text>
      ) : (
        <View style={[styles.options, { marginBottom: spacing.md }]}>
          {methods.map((m) => (
            <Pressable
              key={m.id}
              onPress={() =>
                setForm((f) => ({
                  ...f,
                  paymentMethodId: m.id,
                  paymentMethodName: m.name,
                }))
              }
              style={[
                styles.option,
                {
                  borderColor:
                    form.paymentMethodId === m.id ? theme.primary : theme.border,
                  backgroundColor:
                    form.paymentMethodId === m.id
                      ? theme.primarySoft
                      : theme.surface,
                },
              ]}
            >
              <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
                {m.name}
              </Text>
              {form.paymentMethodId === m.id && (
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.primary}
                />
              )}
            </Pressable>
          ))}
        </View>
      )}

      {error ? (
        <Text style={[typography.caption, { color: theme.danger }]}>
          {error}
        </Text>
      ) : null}
    </FormModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
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
