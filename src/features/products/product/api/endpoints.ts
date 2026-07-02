// ─── Products API Endpoint Constants ──────────────────────────────────

export const PRODUCTS_ENDPOINTS = {
  FIND_ALL: "/products",
  CREATE: "/products",
  FIND_ONE: (id: string) => `/products/${id}`,
  UPDATE: (id: string) => `/products/${id}`,
  SOFT_DELETE: (id: string) => `/products/${id}/soft-delete`,
  RESTORE: (id: string) => `/products/${id}/restore`,
} as const;
