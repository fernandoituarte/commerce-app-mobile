// ─── Media API Endpoint Constants ──────────────────────────────────

export const MEDIA_ENDPOINTS = {
  UPLOAD: "/media",
  DELETE: (id: string) => `/media/${id}`,
} as const;
