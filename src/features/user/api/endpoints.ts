// ─── User API Endpoint Constants ──────────────────────────────────

export const USER_ENDPOINTS = {
  PROFILE: "/saas/users/me",
  UPDATE_PROFILE: "/saas/users/me",
  CHANGE_PASSWORD: "/saas/users/me/password",
  CHANGE_EMAIL_REQUEST: "/saas/users/me/change-email/request",
  CHANGE_EMAIL_CONFIRM: "/saas/users/me/change-email/confirm",
  DEACTIVATE_ACCOUNT: "/saas/users/me/deactivate",
  DELETE_ACCOUNT: "/saas/users/me",
} as const;
