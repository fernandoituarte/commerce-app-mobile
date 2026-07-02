// ─── Order API Endpoint Constants ──────────────────────────────────

export const ORDER_ENDPOINTS = {
  CREATE: "/orders",
  CREATE_POS: "/orders/pos",
  FIND_ALL: "/orders",
  FIND_ONE: (id: string) => `/orders/${id}`,
  UPDATE: (id: string) => `/orders/${id}`,
  ADD_ITEM: (id: string) => `/orders/${id}/items`,
  UPDATE_ITEM: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}`,
  DELETE_ITEM: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}`,
  SEND_TO_KITCHEN: (orderId: string) => `/orders/${orderId}/items/send-to-kitchen`,
  MARK_ITEM_PREPARED: (orderId: string, itemId: string) => `/orders/${orderId}/items/${itemId}/prepared`,
} as const;