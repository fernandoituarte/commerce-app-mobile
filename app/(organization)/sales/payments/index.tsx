import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { FloatingAction } from "@/shared/components/ui";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import {
  useCancelPayment,
  useGetPayments,
} from "@/features/payments/hooks";
import { FailureReason, PaymentStatus } from "@/features/payments/types";
import type { Payment } from "@/features/payments/types";
import { PaymentsFilters } from "@/features/payments/components/payments-filters";
import { PaymentsTable } from "@/features/payments/components/payments-table";
import { CreatePaymentModal } from "@/features/payments/components/create-payment-modal";
import { CancelPaymentDialog } from "@/features/payments/components/cancel-payment-dialog";

// ─── Constants ────────────────────────────────────────────────────

const LIMIT = 20;

// ─── Screen ───────────────────────────────────────────────────────

export default function PaymentsScreen() {
  const { t } = useTranslation();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingCancel, setPendingCancel] = useState<Payment | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, status]);

  const { data, isLoading } = useGetPayments({
    search: query || undefined,
    status: status === "all" ? undefined : (status as PaymentStatus),
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
  });

  const cancelMutation = useCancelPayment();

  const handleCancel = (reason: FailureReason) => {
    if (!pendingCancel) return;
    cancelMutation.mutate(
      { id: pendingCancel.id, data: { failureReason: reason } },
      { onSuccess: () => setPendingCancel(null) },
    );
  };

  return (
    <OrgShell
      title={t("org.paymentsPage.title")}
      scrollable={false}
      padded={false}
    >
      {/* ── Filters ─────────────────────────────────────────────── */}
      <PaymentsFilters
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
      />

      {/* ── List ────────────────────────────────────────────────── */}
      <PaymentsTable
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onCancel={setPendingCancel}
        onCreatePress={() => setCreateOpen(true)}
        canWrite={canWrite}
      />

      <FloatingAction onPress={() => setCreateOpen(true)} disabled={!canWrite} />

      {/* ── Create modal ─────────────────────────────────────────── */}
      <CreatePaymentModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* ── Cancel dialog ────────────────────────────────────────── */}
      <CancelPaymentDialog
        payment={pendingCancel}
        onClose={() => setPendingCancel(null)}
        onConfirm={handleCancel}
      />
    </OrgShell>
  );
}
