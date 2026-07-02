// ─── Extras API Endpoint Constants ──────────────────────────────────

export const EXTRAS_ENDPOINTS = {
  FIND_ALL: "/extras",
  CREATE: "/extras",
  FIND_ONE: (id: string) => `/extras/${id}`,
  UPDATE: (id: string) => `/extras/${id}`,
  SOFT_DELETE: (id: string) => `/extras/${id}/soft-delete`,
  RESTORE: (id: string) => `/extras/${id}/restore`,
} as const;
