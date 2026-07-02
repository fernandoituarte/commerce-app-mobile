import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import type { Customer } from "@/features/customers/types";

interface PermanentDeleteDialogProps {
  customer: Customer | null;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function PermanentDeleteDialog({
  customer,
  onOpenChange,
  onConfirm,
}: PermanentDeleteDialogProps) {
  const { t } = useTranslation();
  const name = customer?.name ?? customer?.email ?? "";

  return (
    <ConfirmDialog
      open={customer !== null}
      onOpenChange={onOpenChange}
      title={t("org.clients.permanentDeleteTitle")}
      description={t("org.clients.permanentDeleteDescription", { name })}
      confirmLabel={t("org.clients.permanentDelete")}
      cancelLabel={t("org.actions.cancel")}
      destructive
      onConfirm={onConfirm}
    />
  );
}
