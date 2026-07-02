// ─── Tags API Endpoint Constants ──────────────────────────────────

export const TAGS_ENDPOINTS = {
  FIND_ALL: "/tags",
  CREATE: "/tags",
  FIND_ONE: (id: string) => `/tags/${id}`,
  UPDATE: (id: string) => `/tags/${id}`,
  SOFT_DELETE: (id: string) => `/tags/${id}/soft-delete`,
  RESTORE: (id: string) => `/tags/${id}/restore`,
} as const;
