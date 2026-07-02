import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { FloatingAction } from "@/shared/components/ui";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import {
  useCreatePaymentMethod,
  useDeletePaymentMethod,
  useGetPaymentMethods,
  useRestorePaymentMethod,
  useUpdatePaymentMethod,
} from "@/features/payment-methods/hooks";
import type {
  CreatePaymentMethodDto,
  PaymentMethod,
  UpdatePaymentMethodDto,
} from "@/features/payment-methods/types";
import { PaymentMethodsFilters } from "@/features/payment-methods/components/payment-methods-filters";
import { PaymentMethodsList } from "@/features/payment-methods/components/payment-methods-list";
import { CreatePaymentMethodModal } from "@/features/payment-methods/components/create-payment-method-modal";
import { EditPaymentMethodModal } from "@/features/payment-methods/components/edit-payment-method-modal";
import { DeletePaymentMethodDialog } from "@/features/payment-methods/components/delete-payment-method-dialog";
import { RestorePaymentMethodDialog } from "@/features/payment-methods/components/restore-payment-method-dialog";

// ─── Constants ────────────────────────────────────────────────────

const LIMIT = 20;

// ─── Screen ───────────────────────────────────────────────────────

export default function PaymentMethodsScreen() {
  const { t } = useTranslation();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PaymentMethod | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PaymentMethod | null>(null);
  const [pendingRestore, setPendingRestore] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, withDeleted]);

  const { data, isLoading } = useGetPaymentMethods({
    search: query || undefined,
    withDeleted,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const createMutation = useCreatePaymentMethod();
  const updateMutation = useUpdatePaymentMethod(editItem?.id ?? "");
  const deleteMutation = useDeletePaymentMethod();
  const restoreMutation = useRestorePaymentMethod();

  const handleCreate = (payload: CreatePaymentMethodDto) => {
    createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = (payload: UpdatePaymentMethodDto) => {
    updateMutation.mutate(payload, { onSuccess: () => setEditItem(null) });
  };

  const handleDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  const handleRestore = () => {
    if (!pendingRestore) return;
    restoreMutation.mutate(pendingRestore.id, {
      onSuccess: () => setPendingRestore(null),
    });
  };

  return (
    <OrgShell title={t("org.payment.title")} scrollable={false} padded={false}>
      {/* ── Filters ─────────────────────────────────────────────── */}
      <PaymentMethodsFilters
        query={query}
        onQueryChange={setQuery}
        withDeleted={withDeleted}
        onToggleDeleted={() => setWithDeleted((v) => !v)}
      />

      {/* ── List ────────────────────────────────────────────────── */}
      <PaymentMethodsList
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={setEditItem}
        onDelete={setPendingDelete}
        onRestore={setPendingRestore}
        onCreatePress={() => setCreateOpen(true)}
        canWrite={canWrite}
      />

      <FloatingAction onPress={() => setCreateOpen(true)} disabled={!canWrite} />

      {/* ── Create modal ─────────────────────────────────────────── */}
      <CreatePaymentMethodModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {/* ── Edit modal ───────────────────────────────────────────── */}
      <EditPaymentMethodModal
        item={editItem}
        onClose={() => setEditItem(null)}
        onSubmit={handleUpdate}
      />

      {/* ── Delete confirmation ──────────────────────────────────── */}
      <DeletePaymentMethodDialog
        item={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />

      {/* ── Restore confirmation ─────────────────────────────────── */}
      <RestorePaymentMethodDialog
        item={pendingRestore}
        onClose={() => setPendingRestore(null)}
        onConfirm={handleRestore}
      />
    </OrgShell>
  );
}
