// ─── API Endpoint Constants ────────────────────────────────────────
// Centralised path definitions – easy to update when the backend changes.

export const AUTH_ENDPOINTS = {
  REGISTER: "/saas/users/register",
  LOGIN: "/saas/users/login",
  LOGOUT: "/saas/users/logout",
  LOGOUT_ALL: "/saas/users/logout-all",
  REFRESH_TOKEN: "/saas/users/refresh",
  FORGOT_PASSWORD: "/saas/users/forgot-password",
  RESET_PASSWORD: "/saas/users/reset-password",

  //oauth
  OAUTH_GOOGLE: "/saas/users/oauth/google",
  
  // ME: "/saas/users/me",
  // DEACTIVATE_ACCOUNT: "/saas/users/me/deactivate",
  // RESTORE_ACCOUNT: "/saas/users/me/restore",
  // CHANGE_PASSWORD: "/saas/users/me/change-password",
} as const;
