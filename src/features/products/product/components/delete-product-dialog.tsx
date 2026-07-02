import React from "react";
import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@/shared/components/ui";
import { useDeleteProduct, useRestoreProduct } from "../hooks";
import type { Product } from "../types";

interface DeleteProductDialogProps {
  pendingDelete: Product | null;
  pendingRestore: Product | null;
  onDeleteClose: () => void;
  onRestoreClose: () => void;
}

export function DeleteProductDialog({
  pendingDelete,
  pendingRestore,
  onDeleteClose,
  onRestoreClose,
}: DeleteProductDialogProps) {
  const { t } = useTranslation();
  const deleteMutation = useDeleteProduct();
  const restoreMutation = useRestoreProduct();

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        onDeleteClose();
      },
    });
  };

  const handleRestore = () => {
    if (!pendingRestore) return;
    restoreMutation.mutate(pendingRestore.id, {
      onSuccess: () => {
        onRestoreClose();
      },
    });
  };

  return (
    <>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && onDeleteClose()}
        title={t("org.products.deleteTitle")}
        description={t("org.products.deleteDescription", { name: pendingDelete?.name ?? "" })}
        confirmLabel={t("org.actions.delete")}
        cancelLabel={t("org.actions.cancel")}
        destructive
        onConfirm={handleDelete}
      />
      <ConfirmDialog
        open={pendingRestore !== null}
        onOpenChange={(v) => !v && onRestoreClose()}
        title={t("org.products.restoreTitle")}
        description={t("org.products.restoreDescription", { name: pendingRestore?.name ?? "" })}
        confirmLabel={t("org.products.restore")}
        cancelLabel={t("org.actions.cancel")}
        onConfirm={handleRestore}
      />
    </>
  );
}
