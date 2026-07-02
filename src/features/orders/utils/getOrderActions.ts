import type { Order } from "../types";
import { OrderStatus } from "../types";

// ─── OrderActions ────────────────────────────────────────────────────────────
// Single source of truth: all action flags are derived exclusively from
// order.status, order.paymentStatus, and the live amountPaid total from
// useOrderPayments. Components never branch on raw string values.

export interface OrderActions {
  /** Order is in an active (non-terminal) state. */
  isActive: boolean;
  /**
   * Order can be marked COMPLETED.
   * Requires: active AND amountPaid >= order.total (fully paid).
   * Pass `amountPaid` from useOrderPayments; defaults to 0 so the flag is
   * false until payment data loads.
   */
  canComplete: boolean;
  /**
   * Alias for canComplete — kept for backward compat with components that
   * already use canClose.
   */
  canClose: boolean;
  /** Can void (cancel) the order. Requires: active. */
  canVoid: boolean;
  /**
   * Can reopen a cancelled order.
   * @todo Backend currently has no CANCELLED → PENDING transition.
   *       Always false until backend adds it to validateStateTransition.
   */
  canReopen: boolean;
  /**
   * Can add / edit / delete items on the order.
   * Requires: active. Backend assertOrderEditable guard is currently a TODO
   * (commented-out); this flag is the only enforced barrier right now.
   */
  canEditItems: boolean;
}

// Statuses that constitute an "active" (non-terminal) order.
const ACTIVE_STATUSES: ReadonlySet<string> = new Set<OrderStatus>([
  OrderStatus.PENDING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
  OrderStatus.REOPENED,
]);

/**
 * @param order - the order object (from useOrderDetails)
 * @param amountPaid - sum of countable payments in DOLLARS (from useOrderPayments).
 *                     Defaults to 0 so flags are conservative before data loads.
 */
export function getOrderActions(
  order: Order | null | undefined,
  amountPaid: number = 0,
): OrderActions {
  if (!order) {
    return {
      isActive: false,
      canComplete: false,
      canClose: false,
      canVoid: false,
      canReopen: false,
      canEditItems: false,
    };
  }

  const isActive = ACTIVE_STATUSES.has(order.status);
  // Use a small epsilon (0.001) to guard against floating-point drift.
  const fullyPaid = amountPaid >= order.total - 0.001;
  const canComplete = isActive && fullyPaid;

  return {
    isActive,
    canComplete,
    canClose: canComplete,    // same semantics, backward-compat alias
    canVoid: isActive,
    // TODO: set to order.status === OrderStatus.CANCELLED once the backend
    // adds CANCELLED → PENDING to validateStateTransition.
    canReopen: false,
    canEditItems: isActive,
  };
}
