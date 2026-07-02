import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import type { Customer } from "@/features/customers/types";

interface PauseCustomerDialogProps {
  customer: Customer | null;
  mode: "pause" | "restore";
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}

export function PauseCustomerDialog({
  customer,
  mode,
  onOpenChange,
  onConfirm,
}: PauseCustomerDialogProps) {
  const { t } = useTranslation();
  const name = customer?.name ?? customer?.email ?? "";

  if (mode === "restore") {
    return (
      <ConfirmDialog
        open={customer !== null}
        onOpenChange={onOpenChange}
        title={t("org.clients.restoreAccountTitle")}
        description={t("org.clients.restoreAccountDescription")}
        confirmLabel={t("org.clients.restoreAccount")}
        cancelLabel={t("org.actions.cancel")}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <ConfirmDialog
      open={customer !== null}
      onOpenChange={onOpenChange}
      title={t("org.clients.pauseTitle")}
      description={t("org.clients.pauseDescription", { name })}
      confirmLabel={t("org.clients.pause")}
      cancelLabel={t("org.actions.cancel")}
      destructive
      onConfirm={onConfirm}
    />
  );
}
