import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FormModal, Input } from "@/shared/components/ui";
import { useCreateCustomer } from "@/features/customers/hooks";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_FORM = { name: "", email: "" };
const DEFAULT_ERRORS = { name: "", email: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateCustomerModal({ open, onClose }: CreateCustomerModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState(DEFAULT_ERRORS);
  const createMutation = useCreateCustomer();

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    setErrors(DEFAULT_ERRORS);
    onClose();
  };

  const validate = (): boolean => {
    const next = { name: "", email: "" };
    if (!form.name.trim()) next.name = t("validation.nameRequired");
    if (!form.email.trim()) {
      next.email = t("validation.emailRequired");
    } else if (!EMAIL_RE.test(form.email)) {
      next.email = t("validation.emailInvalid");
    }
    setErrors(next);
    return !next.name && !next.email;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    createMutation.mutate(
      { name: form.name.trim(), email: form.email.trim() },
      { onSuccess: handleClose },
    );
  };

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title={t("org.clients.create")}
      submitLabel={t("org.actions.create")}
      onSubmit={handleSubmit}
    >
      <Input
        label={t("org.clients.name")}
        value={form.name}
        onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
        placeholder={t("org.clients.namePlaceholder")}
        error={errors.name}
      />
      <Input
        label={t("org.clients.email")}
        value={form.email}
        onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
        placeholder={t("common.emailPlaceholder")}
        keyboardType="email-address"
        error={errors.email}
      />
    </FormModal>
  );
}
