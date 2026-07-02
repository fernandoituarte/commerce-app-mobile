import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { useCreateProduct } from "../hooks";
import { ProductForm, type ProductFormRef } from "./product-form";
import { ProductPayload } from "../types";

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProductModal({ open, onClose }: CreateProductModalProps) {
  const { t } = useTranslation();
  const formRef = useRef<ProductFormRef>(null);
  const mutation = useCreateProduct();

  const handleFormSubmit = (payload: ProductPayload) => {
    mutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <FormModal
      open={open}
      onClose={() => formRef.current?.cancel()}
      onSubmit={() => formRef.current?.submit()}
      title={t("org.products.create")}
      submitLabel={t("org.actions.save")}
    >
      <ProductForm
        ref={formRef}
        originalImageKey=""
        onSubmit={handleFormSubmit}
        onCancel={onClose}
      />
    </FormModal>
  );
}
