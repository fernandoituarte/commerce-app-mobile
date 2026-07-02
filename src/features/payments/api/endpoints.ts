// ─── Payments API Endpoint Constants ──────────────────────────────────

export const PAYMENT_ENDPOINTS = {
  CREATE:   "/payments/manual",
  FIND_ALL: "/payments",
  FIND_ONE: (id: string) => `/payments/${id}`,
  CANCEL:   (id: string) => `/payments/${id}/cancel`,
} as const;