// ─── Payment Methods API Endpoint Constants ──────────────────────────────────

export const PAYMENT_METHODS_ENDPOINTS = {
  FIND_ALL:    "/payment-methods",
  CREATE:      "/payment-methods",
  FIND_ONE:    (id: string) => `/payment-methods/${id}`,
  UPDATE:      (id: string) => `/payment-methods/${id}`,
  SOFT_DELETE: (id: string) => `/payment-methods/${id}/delete`, 
  RESTORE:     (id: string) => `/payment-methods/${id}/restore`,
} as const;