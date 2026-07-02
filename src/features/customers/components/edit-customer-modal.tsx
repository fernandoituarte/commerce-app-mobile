import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormModal, Input } from "@/shared/components/ui";
import { useUpdateCustomer } from "@/features/customers/hooks";
import type { Customer } from "@/features/customers/types";

interface EditCustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
}

export function EditCustomerModal({ customer, onClose }: EditCustomerModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const updateMutation = useUpdateCustomer();

  useEffect(() => {
    if (customer) setName(customer.name ?? "");
  }, [customer]);

  const handleSubmit = () => {
    if (!customer) return;
    updateMutation.mutate({ id: customer.id, data: { name } }, { onSuccess: onClose });
  };

  return (
    <FormModal
      open={customer !== null}
      onClose={onClose}
      title={t("org.clients.edit")}
      submitLabel={t("org.actions.save")}
      onSubmit={handleSubmit}
    >
      <Input
        label={t("org.clients.name")}
        value={name}
        onChangeText={setName}
        placeholder={t("org.clients.namePlaceholder")}
      />
    </FormModal>
  );
}
