import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import type { PaymentMethod } from "../types";

interface DeletePaymentMethodDialogProps {
  item: PaymentMethod | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeletePaymentMethodDialog({
  item,
  onClose,
  onConfirm,
}: DeletePaymentMethodDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={item !== null}
      onOpenChange={(v) => !v && onClose()}
      title={t("org.payment.deleteTitle")}
      description={t("org.payment.deleteDescription", {
        name: item?.name ?? "",
      })}
      confirmLabel={t("org.actions.delete")}
      cancelLabel={t("org.actions.cancel")}
      destructive
      onConfirm={onConfirm}
    />
  );
}
