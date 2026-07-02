import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useAppSelector } from "../../../core/store/hooks";
import type {
  CreatePosOrderDto,
  CreateOrderDto,
  CreateOrderItemDto,
  UpdateOrderDto,
  UpdateOrderItemQuantityDto,
  UpdateOrderItemFullDto,
  OrderParams,
  Orders,
  Order,
} from "../types";
import { ordersService } from "../api/orders.service";
import { paymentsService } from "../../payments/api/payments.service";
import type { CreateManualPaymentDto } from "../../payments/types";

const ORDERS_KEY = "orders";

// ─── useOrders ───────────────────────────────────────────────

export function useOrders(pagination: OrderParams) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useQuery<Orders, Error>({
    queryKey: [ORDERS_KEY, currentOrganizationId, pagination],
    enabled: Boolean(currentOrganizationId),
    queryFn: () => ordersService.getOrders(pagination),
  });
}

// ─── useOrderDetails ─────────────────────────────────────────

export function useOrderDetails(orderId: string) {
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useQuery<Order, Error>({
    queryKey: [ORDERS_KEY, currentOrganizationId, orderId],
    enabled: Boolean(orderId) && Boolean(currentOrganizationId),
    queryFn: () => ordersService.getOrderDetails(orderId),
  });
}

// ─── useCreatePosOrder ───────────────────────────────────────

export function useCreatePosOrder() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Order, Error, CreatePosOrderDto>({
    mutationFn: (data) => ordersService.createPosOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useCreateOrder ──────────────────────────────────────────

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Order, Error, CreateOrderDto>({
    mutationFn: (data) => ordersService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useUpdateOrder ──────────────────────────────────────────

export function useUpdateOrder(orderId: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Order, Error, UpdateOrderDto>({
    mutationFn: (data) => ordersService.updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, orderId] });
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useUpdateOrderItem ───────────────────────────────────────

export function useUpdateOrderItem() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useMutation<
    Order,
    Error,
    { orderId: string; itemId: string; dto: UpdateOrderItemFullDto }
  >({
    mutationFn: ({ orderId, itemId, dto }) =>
      ordersService.updateItem(orderId, itemId, dto),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.setQueryData(
        [ORDERS_KEY, currentOrganizationId, orderId],
        updatedOrder,
      );
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useUpdateOrderItemQuantity ──────────────────────────────

export function useUpdateOrderItemQuantity() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useMutation<
    Order,
    Error,
    { orderId: string; itemId: string; quantity: number }
  >({
    mutationFn: ({ orderId, itemId, quantity }) =>
      ordersService.updateItemQuantity(orderId, itemId, quantity),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.setQueryData(
        [ORDERS_KEY, currentOrganizationId, orderId],
        updatedOrder,
      );
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useRemoveOrderItem ───────────────────────────────────────

export function useRemoveOrderItem() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useMutation<Order, Error, { orderId: string; itemId: string }>({
    mutationFn: ({ orderId, itemId }) =>
      ordersService.removeItem(orderId, itemId),
    onSuccess: (updatedOrder, { orderId }) => {
      queryClient.setQueryData(
        [ORDERS_KEY, currentOrganizationId, orderId],
        updatedOrder,
      );
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useAddOrderItem ─────────────────────────────────────────

export function useAddOrderItem() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useMutation<Order, Error, { orderId: string; item: CreateOrderItemDto }>({
    mutationFn: ({ orderId, item }) =>
      ordersService.addItem(orderId, item),
    onSuccess: (updatedOrder, { orderId }) => {
      // Update the order detail cache immediately from the response —
      // the center column (OrderDetailPanel) reflects the new item instantly.
      queryClient.setQueryData(
        [ORDERS_KEY, currentOrganizationId, orderId],
        updatedOrder,
      );
      // Refresh the orders list so totals stay in sync.
      queryClient.invalidateQueries({
        queryKey: [ORDERS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useCloseOrder ───────────────────────────────────────────────
// Handles the final step of completing an order.
//
// Two paths:
//   1. close(paymentDto) — records a final payment, then PATCHes status=COMPLETED.
//      Use this when the quick-pay shortcut in OrderDetailPanel covers the
//      remaining balance in one shot.
//   2. close() — skips the payment step and goes straight to PATCH.
//      Use this when payments have already been accumulated via PaymentPanel
//      and the remaining balance is zero.
//
// Partial-failure guard: if payment succeeds but PATCH fails, the state
// transitions to "patch_failed" with a retry() closure that re-runs only the
// PATCH — preventing duplicate payments on retry.

export type CloseOrderState =
  | { phase: "idle" }
  | { phase: "paying" }
  | { phase: "patching" }
  | { phase: "patch_failed"; retry: () => void }
  | { phase: "done" }
  | { phase: "error"; message: string };

const PAYMENTS_KEY = "payments";

export function useCloseOrder(orderId: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);
  const [state, setState] = useState<CloseOrderState>({ phase: "idle" });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, currentOrganizationId, orderId] });
    queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, currentOrganizationId] });
    // Refresh the payments cache so amountPaid/remaining reflect the completed state.
    queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY, currentOrganizationId, orderId] });
    queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY, currentOrganizationId] });
  }, [queryClient, currentOrganizationId, orderId]);

  const doPatch = useCallback(async () => {
    setState({ phase: "patching" });
    try {
      await ordersService.updateOrder(orderId, { status: "COMPLETED" });
      invalidate();
      setState({ phase: "done" });
    } catch (err: any) {
      const retry = () => doPatch();
      setState({ phase: "patch_failed", retry });
    }
  }, [orderId, invalidate]);

  /**
   * @param paymentDto - optional. When provided, a manual payment is recorded
   *   before the order is marked COMPLETED. When omitted, the PATCH fires
   *   immediately (balance must already be zero via prior PaymentPanel entries).
   */
  const close = useCallback(async (paymentDto?: CreateManualPaymentDto) => {
    if (paymentDto) {
      setState({ phase: "paying" });
      try {
        await paymentsService.createManualPayment(paymentDto);
        // Refresh payments cache immediately so useOrderPayments sees the new entry.
        queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY, currentOrganizationId, orderId] });
        queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY, currentOrganizationId] });
      } catch (err: any) {
        setState({ phase: "error", message: err?.message ?? "payment_failed" });
        return;
      }
    }
    await doPatch();
  }, [doPatch, queryClient, currentOrganizationId, orderId]);

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  return { state, close, reset };
}

// ─── useSendToKitchen ────────────────────────────────────────
// Bulk-flips all NEW items on the order to SENT_TO_KITCHEN.

export function useSendToKitchen(orderId: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useMutation<Order, Error, void>({
    mutationFn: () => ordersService.sendToKitchen(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, currentOrganizationId, orderId] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, currentOrganizationId] });
    },
  });
}

// ─── useMarkItemPrepared ─────────────────────────────────────
// Marks a single item SENT_TO_KITCHEN → PREPARED (KDS side).

export function useMarkItemPrepared(orderId: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector((state) => state.organization);

  return useMutation<Order, Error, { itemId: string }>({
    mutationFn: ({ itemId }) => ordersService.markItemPrepared(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, currentOrganizationId, orderId] });
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, currentOrganizationId] });
    },
  });
}