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
  VERIFY_EMAIL: "/saas/users/verify-email",
  RESEND_VERIFICATION: "/saas/users/resend-verification",

  RESTORE_ACCOUNT: "/saas/users/me/restore",

  //oauth
  OAUTH_GOOGLE: "/saas/users/oauth/google",
} as const;
