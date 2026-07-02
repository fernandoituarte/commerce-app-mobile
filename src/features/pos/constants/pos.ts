import type { OrderStatus, ItemStatus } from "../mocks/pos";

export const TAX_RATE = 0.1;

export const ORDER_STATUS_TONE: Record<OrderStatus, "warning" | "primary" | "success" | "neutral" | "danger"> = {
  pending: "warning",
  preparing: "primary",
  ready: "success",
  delivered: "neutral",
  cancelled: "danger",
};

export const ITEM_STATUS_TONE: Record<ItemStatus, "warning" | "primary" | "success" | "neutral"> = {
  new: "warning",
  preparing: "primary",
  ready: "success",
  served: "neutral",
};

export const ORDER_STATUS_DOT: Record<OrderStatus, string> = {
  pending: "#f59e0b",
  preparing: "#2563eb",
  ready: "#22c55e",
  delivered: "#64748b",
  cancelled: "#ef4444",
};

// Panel widths for 3-col tablet layout
export const LEFT_COL_WIDTH = 224;
export const CENTER_COL_WIDTH = 308;
