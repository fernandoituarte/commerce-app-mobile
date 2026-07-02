import React, { useEffect } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { useCreatePosOrder, useUpdateOrder } from "@/features/orders/hooks";
import { posOrderSchema, type PosOrderFormValues } from "@/features/orders/validations";
import type { Order } from "@/features/orders/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateModeProps {
  mode?: "create";
  open: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  orderId?: never;
  initialCustomerName?: never;
  onOrderUpdated?: never;
}

interface EditModeProps {
  mode: "edit";
  open: boolean;
  onClose: () => void;
  orderId: string;
  initialCustomerName?: string;
  onOrderUpdated: () => void;
  onOrderCreated?: never;
}

type NewOrderModalProps = CreateModeProps | EditModeProps;

// ─── NewOrderModal ─────────────────────────────────────────────────────────────

export function NewOrderModal(props: NewOrderModalProps) {
  const { open, onClose } = props;
  const isEdit = props.mode === "edit";

  const { t } = useTranslation();
  const theme = useTheme();

  const createMutation = useCreatePosOrder();
  // Hooks must be called unconditionally; orderId is "" in create mode and
  // the mutation is never called on that path.
  const updateMutation = useUpdateOrder(isEdit ? props.orderId : "");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<PosOrderFormValues>({
    resolver: zodResolver(posOrderSchema),
    defaultValues: { customerName: "" },
  });

  // Reset form to correct initial value each time the modal opens, so state
  // never bleeds between create→edit→create transitions.
  useEffect(() => {
    if (open) {
      reset({ customerName: isEdit ? (props.initialCustomerName ?? "") : "" });
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    reset();
    createMutation.reset();
    updateMutation.reset();
    onClose();
  };

  const onSubmit = (values: PosOrderFormValues) => {
    const customerName = values.customerName?.trim() || undefined;

    if (isEdit) {
      updateMutation.mutate(
        { customerName },
        {
          onSuccess: () => {
            props.onOrderUpdated();
            handleClose();
          },
          onError: (err) => setError("root", { message: err.message }),
        },
      );
    } else {
      createMutation.mutate(
        { customerName },
        {
          onSuccess: (order) => {
            reset();
            props.onOrderCreated!(order);
          },
          onError: (err) => setError("root", { message: err.message }),
        },
      );
    }
  };

  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending;

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={isEdit ? t("pos.orders.edit.title") : t("pos.orders.new.title")}
      submitLabel={isEdit ? t("pos.orders.edit.confirm") : t("pos.orders.new.confirm")}
      onSubmit={handleSubmit(onSubmit)}
      submitLoading={isPending}
    >
      <View style={styles.field}>
        <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs }]}>
          {t("pos.orders.new.customerName").toUpperCase()}
        </Text>
        <Controller
          control={control}
          name="customerName"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={t("pos.orders.new.customerNamePlaceholder")}
              placeholderTextColor={theme.textMuted}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              style={[
                styles.input,
                {
                  color: theme.text,
                  backgroundColor: theme.surface,
                  borderColor: errors.customerName ? theme.danger : theme.border,
                },
              ]}
            />
          )}
        />
        {errors.customerName && (
          <Text style={[typography.caption, { color: theme.danger, marginTop: 4 }]}>
            {errors.customerName.message}
          </Text>
        )}
      </View>

      {errors.root && (
        <Text style={[typography.caption, { color: theme.danger, marginTop: spacing.xs }]}>
          {errors.root.message}
        </Text>
      )}
    </FormModal>
  );
}

const styles = StyleSheet.create({
  field: { gap: 0, marginBottom: spacing.xs },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
});
