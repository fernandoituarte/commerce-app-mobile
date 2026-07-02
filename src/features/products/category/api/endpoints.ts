// ─── Categories API Endpoint Constants ──────────────────────────────────

export const CATEGORIES_ENDPOINTS = {
  FIND_ALL: "/categories",
  FIND_ONE: (id: string) => `/categories/${id}`,
  UPDATE: (id: string) => `/categories/${id}`,
  SOFT_DELETE: (id: string) => `/categories/${id}/soft-delete`,
  RESTORE: (id: string) => `/categories/${id}/restore`,
  CREATE: "/categories",
} as const;
