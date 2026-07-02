import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { FloatingAction } from "@/shared/components/ui";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import { useOrders } from "@/features/orders/hooks";
import { OrdersFilters } from "@/features/orders/components/orders-filters";
import { OrdersTable } from "@/features/orders/components/orders-table";
import { CreateOrderModal } from "@/features/orders/components/create-order-modal";
import { OrderStatus, DASHBOARD_DEFAULT_ORDER_STATUSES } from "@/features/orders/types";

const LIMIT = 20;

export default function OrdersScreen() {
  const { t } = useTranslation();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);

  // Reset to page 1 whenever search or status filter changes.
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  // "all" uses the dashboard default (currently no param → backend returns every
  // status). When ARCHIVED is added, DASHBOARD_DEFAULT_ORDER_STATUSES will become
  // an explicit array excluding archived — no other code needs to change.
  const activeStatus =
    statusFilter === "all" ? DASHBOARD_DEFAULT_ORDER_STATUSES : statusFilter;

  const { data, isLoading } = useOrders({
    search: query || undefined,
    limit: LIMIT,
    offset: (page - 1) * LIMIT,
    status: activeStatus,
  });

  return (
    <OrgShell title={t("org.orders.title")} scrollable={false} padded={false}>
      <OrdersFilters
        query={query}
        onQueryChange={setQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <OrdersTable
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />

      <FloatingAction onPress={() => setCreateOpen(true)} disabled={!canWrite} />

      <CreateOrderModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </OrgShell>
  );
}
