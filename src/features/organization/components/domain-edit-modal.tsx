import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FormModal, Input } from "@/shared/components/ui";
import type { OrganizationDomain } from "@/features/organization-domains/types";

interface DomainEditModalProps {
  domain: OrganizationDomain | null;
  onClose: () => void;
  onSubmit: (id: string, value: string) => void;
  isPending: boolean;
}

export function DomainEditModal({ domain, onClose, onSubmit, isPending }: DomainEditModalProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (domain) setValue(domain.domain);
  }, [domain?.id]);

  function handleSubmit() {
    if (!domain || !value.trim()) return;
    onSubmit(domain.id, value.trim());
  }

  return (
    <FormModal
      open={domain !== null}
      onClose={onClose}
      title={t("org.profile.domainEditTitle")}
      submitLabel={t("org.actions.save")}
      onSubmit={handleSubmit}
    >
      <Input
        label={t("org.profile.domainEditLabel")}
        value={value}
        onChangeText={setValue}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        autoFocus
      />
    </FormModal>
  );
}
