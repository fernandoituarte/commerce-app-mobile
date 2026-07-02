import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/components/ui";
import { useUpdateProduct } from "../hooks";
import { mapProductToForm } from "../helpers/product.helpers";
import { ProductForm, type ProductFormRef } from "./product-form";
import type { Product, ProductPayload } from "../types";

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const { t } = useTranslation();
  const formRef = useRef<ProductFormRef>(null);
  const mutation = useUpdateProduct(product?.id ?? "");

  const handleFormSubmit = (payload: ProductPayload) => {
    mutation.mutate(payload, { onSuccess: onClose });
  };

  if (!product) return null;

  return (
    <FormModal
      open={product !== null}
      onClose={() => formRef.current?.cancel()}
      onSubmit={() => formRef.current?.submit()}
      title={t("org.products.edit")}
      submitLabel={t("org.actions.save")}
    >
      <ProductForm
        key={product.id}
        ref={formRef}
        initialValues={mapProductToForm(product)}
        originalImageKey={product.image?.key ?? ""}
        onSubmit={handleFormSubmit}
        onCancel={onClose}
      />
    </FormModal>
  );
}
