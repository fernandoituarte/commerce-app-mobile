import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import {
  useCustomers,
  useDeleteCustomer,
  useRestoreCustomer,
  useSoftDeleteCustomer,
} from "@/features/customers/hooks";
import { FloatingAction } from "@/shared/components/ui";
import { CustomersFilters } from "@/features/customers/components/customers-filters";
import { CustomersTable } from "@/features/customers/components/customers-table";
import { CreateCustomerModal } from "@/features/customers/components/create-customer-modal";
import { EditCustomerModal } from "@/features/customers/components/edit-customer-modal";
import { PauseCustomerDialog } from "@/features/customers/components/pause-customer-dialog";
import { PermanentDeleteDialog } from "@/features/customers/components/permanent-delete-dialog";
import type { Customer } from "@/features/customers/types";

const LIMIT = 20;

export default function ClientsScreen() {
  const { t } = useTranslation();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [pendingPause, setPendingPause] = useState<Customer | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Customer | null>(null);
  const [pendingPermanentDelete, setPendingPermanentDelete] = useState<Customer | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, withDeleted]);

  const { data, isLoading } = useCustomers({
    search: query || undefined,
    withDeleted,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const softDeleteMutation = useSoftDeleteCustomer();
  const restoreMutation = useRestoreCustomer();
  const permanentDeleteMutation = useDeleteCustomer();

  const handlePause = () => {
    if (!pendingPause) return;
    softDeleteMutation.mutate(pendingPause.id, {
      onSuccess: () => setPendingPause(null),
    });
  };

  const handleRestore = () => {
    if (!pendingRestore) return;
    restoreMutation.mutate(pendingRestore.id, {
      onSuccess: () => setPendingRestore(null),
    });
  };

  const handlePermanentDelete = () => {
    if (!pendingPermanentDelete) return;
    permanentDeleteMutation.mutate(pendingPermanentDelete.id, {
      onSuccess: () => setPendingPermanentDelete(null),
    });
  };

  return (
    <OrgShell title={t("org.clients.title")} scrollable={false} padded={false}>
      <CustomersFilters
        query={query}
        onQueryChange={setQuery}
        withDeleted={withDeleted}
        onWithDeletedChange={setWithDeleted}
      />

      <CustomersTable
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={setEditCustomer}
        onPause={setPendingPause}
        onRestore={setPendingRestore}
        onPermanentDelete={setPendingPermanentDelete}
        canWrite={canWrite}
      />

      <EditCustomerModal
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
      />

      <PauseCustomerDialog
        customer={pendingPause}
        mode="pause"
        onOpenChange={(v) => !v && setPendingPause(null)}
        onConfirm={handlePause}
      />

      <PauseCustomerDialog
        customer={pendingRestore}
        mode="restore"
        onOpenChange={(v) => !v && setPendingRestore(null)}
        onConfirm={handleRestore}
      />

      <PermanentDeleteDialog
        customer={pendingPermanentDelete}
        onOpenChange={(v) => !v && setPendingPermanentDelete(null)}
        onConfirm={handlePermanentDelete}
      />

      <FloatingAction onPress={() => setCreateOpen(true)} disabled={!canWrite} />

      <CreateCustomerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </OrgShell>
  );
}
