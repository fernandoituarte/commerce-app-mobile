// ─── Ingredients API Endpoint Constants ──────────────────────────────────

export const INGREDIENTS_ENDPOINTS = {
  FIND_ALL: "/ingredients",
  CREATE: "/ingredients",
  FIND_ONE: (id: string) => `/ingredients/${id}`,
  UPDATE: (id: string) => `/ingredients/${id}`,
  SOFT_DELETE: (id: string) => `/ingredients/${id}/soft-delete`,
  RESTORE: (id: string) => `/ingredients/${id}/restore`,
} as const;
