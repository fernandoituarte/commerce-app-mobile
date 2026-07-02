// ─── Customer API Endpoint Constants ──────────────────────────────────

export const CUSTOMER_ENDPOINTS = {
  CREATE: "/customers",
  FIND_ALL: "/customers",
  FIND_ONE: (id: string) => `/customers/${id}`,
  UPDATE: (id: string) => `/customers/${id}`,
  SOFT_DELETE: (id: string) => `/customers/${id}/deactivate`,
  RESTORE: (id: string) => `/customers/${id}/restore`,
  DELETE: (id: string) => `/customers/${id}/delete-account`
} as const;