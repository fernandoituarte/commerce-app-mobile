import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { FailureReason } from "../types";
import type { Payment } from "../types";

// ─── Constants ────────────────────────────────────────────────────

// Staff-appropriate reasons (subset of backend FailureReason enum).
// OTHER was removed — it doesn't exist in the backend enum and would 400.
const CANCEL_REASONS: FailureReason[] = [
  FailureReason.WRONG_AMOUNT,
  FailureReason.WRONG_PAYMENT_METHOD,
  FailureReason.CUSTOMER_CANCELLED,
  FailureReason.DUPLICATE_PAYMENT,
];

// ─── Component ────────────────────────────────────────────────────

interface CancelPaymentDialogProps {
  payment: Payment | null;
  onClose: () => void;
  onConfirm: (reason: FailureReason) => void;
}

export function CancelPaymentDialog({
  payment,
  onClose,
  onConfirm,
}: CancelPaymentDialogProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [reason, setReason] = useState<FailureReason>(FailureReason.CUSTOMER_CANCELLED);

  useEffect(() => {
    if (payment) setReason(FailureReason.CUSTOMER_CANCELLED);
  }, [payment]);

  return (
    <FormModal
      open={payment !== null}
      onClose={onClose}
      title={t("org.paymentsPage.cancelTitle")}
      submitLabel={t("org.paymentsPage.cancelConfirm")}
      onSubmit={() => onConfirm(reason)}
    >
      {/* Warning */}
      <View
        style={[
          styles.warning,
          { backgroundColor: theme.dangerSoft, borderColor: theme.danger },
        ]}
      >
        <Ionicons name="warning-outline" size={18} color={theme.danger} />
        <Text style={[typography.bodySm, { color: theme.danger, flex: 1 }]}>
          {t("org.paymentsPage.cancelWarning")}
        </Text>
      </View>

      {/* Reason selector */}
      <Text
        style={[
          typography.caption,
          { color: theme.textMuted, marginBottom: spacing.sm },
        ]}
      >
        {t("org.paymentsPage.cancelReasonLabel").toUpperCase()}
      </Text>
      <View style={styles.options}>
        {CANCEL_REASONS.map((r) => (
          <Pressable
            key={r}
            onPress={() => setReason(r)}
            style={[
              styles.option,
              {
                borderColor: r === reason ? theme.primary : theme.border,
                backgroundColor:
                  r === reason ? theme.primarySoft : theme.surface,
              },
            ]}
          >
            <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
              {t(`org.paymentsPage.failureReason.${r}`, { defaultValue: r })}
            </Text>
            {r === reason && (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.primary}
              />
            )}
          </Pressable>
        ))}
      </View>
    </FormModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  warning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.md,
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
