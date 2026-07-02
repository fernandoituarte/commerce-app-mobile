// ─── Session API Endpoint Constants────────────────────────────────────────

export const SESSION_ENDPOINTS = {
  LOGOUT: "/saas/users/logout",
  LOGOUT_ALL: "/saas/users/logout-all",
  REVOKE_SESSION: (jti: string) => `/saas/users/me/sessions/${jti}`,
  GET_ALL_SESSIONS: "/saas/users/me/sessions",
} as const;
