import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { Ionicons } from "@expo/vector-icons";
import { VoidReason } from "@/features/orders/types";

// ─── Schema ─────────────────────────────────────────────────────────────────

const voidSchema = z
  .object({
    voidReason: z.nativeEnum(VoidReason),
    voidReasonDetails: z.string().max(500).optional(),
  })
  .superRefine((val, ctx) => {
    if (
      val.voidReason === VoidReason.OTHER &&
      (!val.voidReasonDetails || val.voidReasonDetails.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["voidReasonDetails"],
        message: "required_when_other",
      });
    }
  });

export type VoidFormValues = z.infer<typeof voidSchema>;

// Single mapping enum → i18n key so labels are never scattered
export const VOID_REASON_LABEL_KEY: Record<VoidReason, string> = {
  [VoidReason.CUSTOMER_REQUEST]: "pos.void.reasons.customerRequest",
  [VoidReason.KITCHEN_ERROR]:    "pos.void.reasons.kitchenError",
  [VoidReason.OUT_OF_STOCK]:     "pos.void.reasons.outOfStock",
  [VoidReason.DUPLICATE]:        "pos.void.reasons.duplicate",
  [VoidReason.OTHER]:            "pos.void.reasons.other",
};

const VOID_REASONS = Object.values(VoidReason);

// ─── VoidOrderModal ──────────────────────────────────────────────────────────

interface VoidOrderModalProps {
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: (values: VoidFormValues) => void;
}

export function VoidOrderModal({
  open,
  isLoading,
  onClose,
  onConfirm,
}: VoidOrderModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<VoidFormValues>({
    resolver: zodResolver(voidSchema),
    defaultValues: { voidReason: undefined, voidReasonDetails: "" },
  });

  const selectedReason = watch("voidReason");
  const showDetails = selectedReason === VoidReason.OTHER;

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit((values) => {
    onConfirm(values);
  });

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("pos.void.title")}
      submitLabel={t("pos.void.confirm")}
      onSubmit={submit}
      submitLoading={isLoading}
    >
      {/* Reason selector */}
      <Text
        style={[
          typography.caption,
          { color: theme.textMuted, marginBottom: spacing.sm },
        ]}
      >
        {t("pos.void.reasonLabel")}
      </Text>

      <Controller
        control={control}
        name="voidReason"
        render={({ field: { value, onChange } }) => (
          <View style={styles.options}>
            {VOID_REASONS.map((reason) => {
              const active = value === reason;
              return (
                <Pressable
                  key={reason}
                  onPress={() => onChange(reason)}
                  style={[
                    styles.option,
                    {
                      borderColor: active ? theme.danger : theme.border,
                      backgroundColor: active
                        ? theme.danger + "18"
                        : theme.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.bodySm,
                      {
                        color: active ? theme.danger : theme.text,
                        fontWeight: active ? "700" : "400",
                        flex: 1,
                      },
                    ]}
                  >
                    {t(VOID_REASON_LABEL_KEY[reason])}
                  </Text>
                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={theme.danger}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      />

      {errors.voidReason && (
        <Text style={[typography.caption, { color: theme.danger, marginTop: spacing.xs }]}>
          {t("pos.void.errors.reasonRequired")}
        </Text>
      )}

      {/* Details input — visible always, required only for OTHER */}
      <View style={{ marginTop: spacing.md }}>
        <Text
          style={[
            typography.caption,
            {
              color: showDetails ? theme.text : theme.textMuted,
              marginBottom: spacing.xs,
              fontWeight: showDetails ? "600" : "400",
            },
          ]}
        >
          {t("pos.void.detailsLabel")}
          {showDetails && (
            <Text style={{ color: theme.danger }}> *</Text>
          )}
        </Text>

        <Controller
          control={control}
          name="voidReasonDetails"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t("pos.void.detailsPlaceholder")}
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={500}
              style={[
                styles.detailsInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: errors.voidReasonDetails
                    ? theme.danger
                    : theme.border,
                },
              ]}
            />
          )}
        />

        {errors.voidReasonDetails && (
          <Text
            style={[
              typography.caption,
              { color: theme.danger, marginTop: spacing.xs },
            ]}
          >
            {t("pos.void.errors.detailsRequired")}
          </Text>
        )}
      </View>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  options: { gap: spacing.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  detailsInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 14,
  },
});
