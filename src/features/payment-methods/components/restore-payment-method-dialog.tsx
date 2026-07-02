import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import type { PaymentMethod } from "../types";

interface RestorePaymentMethodDialogProps {
  item: PaymentMethod | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function RestorePaymentMethodDialog({
  item,
  onClose,
  onConfirm,
}: RestorePaymentMethodDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={item !== null}
      onOpenChange={(v) => !v && onClose()}
      title={t("org.payment.restoreTitle")}
      description={t("org.payment.restoreDescription", {
        name: item?.name ?? "",
      })}
      confirmLabel={t("org.payment.restore")}
      cancelLabel={t("org.actions.cancel")}
      onConfirm={onConfirm}
    />
  );
}
