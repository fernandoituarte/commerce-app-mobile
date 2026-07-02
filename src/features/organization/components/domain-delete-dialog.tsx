import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import type { OrganizationDomain } from "@/features/organization-domains/types";

interface DomainDeleteDialogProps {
  domain: OrganizationDomain | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function DomainDeleteDialog({ domain, onClose, onConfirm }: DomainDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      open={domain !== null}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={t("org.profile.domainDeleteTitle")}
      description={t("org.profile.domainDeleteDescription")}
      confirmLabel={t("org.actions.delete")}
      cancelLabel={t("org.actions.cancel")}
      onConfirm={() => { if (domain) onConfirm(domain.id); }}
      destructive
    />
  );
}
