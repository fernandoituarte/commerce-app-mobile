import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/core/store/hooks";
import type {
  Payment,
  PaymentDetails,
  PaymentsResponse,
  PaymentsFilters,
  CreateManualPaymentDto,
  CancelPaymentDto,
} from "../types";
import { COUNTABLE_PAYMENT_STATUSES } from "../types";
import { paymentsService } from "../api/payments.service";

const PAYMENTS_KEY = "payments";
const ORDERS_KEY = "orders";

// ─── useGetPayments ───────────────────────────────────────────────

export function useGetPayments(params: PaymentsFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useQuery<PaymentsResponse, Error>({
    queryKey: [PAYMENTS_KEY, currentOrganizationId, params],
    enabled: Boolean(currentOrganizationId),
    queryFn: () => paymentsService.getPayments(params),
  });
}

// ─── useOrderPayments ─────────────────────────────────────────────
// Single source of truth for payments belonging to one order.
// Both OrderDetailPanel and PaymentPanel call this hook; React Query
// deduplicates the fetch so only one network request is made.
//
// `amount` in each payment is CENTS (stored as int in the database;
// the gateway multiplies by 100 on write). This hook divides by 100
// before summing so callers work in dollars throughout.

export interface OrderPaymentsResult {
  /** All payments for display (includes CANCELLED / REFUNDED). */
  allPayments: Payment[];
  /** Countable payments only (PENDING / PROCESSING / COMPLETED / PAID) — used for balance. */
  payments: Payment[];
  amountPaid: number;      // dollars, countable payments only
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useOrderPayments(orderId: string): OrderPaymentsResult {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  const query = useQuery<PaymentsResponse, Error>({
    queryKey: [PAYMENTS_KEY, currentOrganizationId, orderId],
    enabled: Boolean(currentOrganizationId) && Boolean(orderId),
    queryFn: () => paymentsService.getPayments({ orderId, limit: 100 }),
  });

  const { allPayments, payments, amountPaid } = useMemo(() => {
    const all = query.data?.items ?? [];
    const countable = all.filter((p) => COUNTABLE_PAYMENT_STATUSES.has(p.status));
    const paid = countable.reduce((sum, p) => sum + p.amount / 100, 0);
    return { allPayments: all, payments: countable, amountPaid: paid };
  }, [query.data]);

  return {
    allPayments,
    payments,
    amountPaid,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

// ─── useGetPaymentById ────────────────────────────────────────────

export function useGetPaymentById(id: string) {
  return useQuery<PaymentDetails, Error>({
    queryKey: [PAYMENTS_KEY, id],
    enabled: Boolean(id),
    queryFn: () => paymentsService.getPaymentById(id),
  });
}

// ─── useCreateManualPayment ───────────────────────────────────────

export function useCreateManualPayment() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Payment, Error, CreateManualPaymentDto>({
    mutationFn: (data) => paymentsService.createManualPayment(data),
    onSuccess: (_data, variables) => {
      // Invalidate the per-order payments cache (prefix match cascades).
      queryClient.invalidateQueries({
        queryKey: [PAYMENTS_KEY, currentOrganizationId, variables.orderId],
      });
      // Also invalidate the broader payments list and the orders cache.
      queryClient.invalidateQueries({
        queryKey: [PAYMENTS_KEY, currentOrganizationId],
      });
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useCancelPayment ─────────────────────────────────────────────

export function useCancelPayment() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, { id: string; data: CancelPaymentDto }>({
    mutationFn: ({ id, data }) => paymentsService.cancelPayment(id, data),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY, id] });
      queryClient.invalidateQueries({
        queryKey: [PAYMENTS_KEY, currentOrganizationId],
      });
    },
  });
}
