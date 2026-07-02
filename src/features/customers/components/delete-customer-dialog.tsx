import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import type { Customer } from "@/features/customers/types";

interface DeleteCustomerDialogProps {
  customer: Customer | null;
  mode: "delete" | "restore";
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function DeleteCustomerDialog({
  customer,
  mode,
  onOpenChange,
  onConfirm,
}: DeleteCustomerDialogProps) {
  const { t } = useTranslation();
  const name = customer?.name ?? customer?.email ?? "";

  if (mode === "restore") {
    return (
      <ConfirmDialog
        open={customer !== null}
        onOpenChange={onOpenChange}
        title={t("org.clients.restoreTitle")}
        description={t("org.clients.restoreDescription", { name })}
        confirmLabel={t("org.clients.restore")}
        cancelLabel={t("org.actions.cancel")}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <ConfirmDialog
      open={customer !== null}
      onOpenChange={onOpenChange}
      title={t("org.clients.deleteTitle")}
      description={t("org.clients.deleteDescription", { name })}
      confirmLabel={t("org.actions.delete")}
      cancelLabel={t("org.actions.cancel")}
      destructive
      onConfirm={onConfirm}
    />
  );
}
