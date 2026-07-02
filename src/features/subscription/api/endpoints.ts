// ─── Subscription API Endpoint Constants ──────────────────────────────────

export const SUBSCRIPTION_ENDPOINTS = {
  PLANS: "/subscription/plans",
  CREATE_ONBOARDING_SESSION: "/subscription/onboarding/create-session",
  GET_SUBSCRIPTION: "/subscription/me",
  GET_SUBSCRIPTION_HISTORY: "/subscription/me/history",
  CHANGE_PLAN: (id: string) => `/subscription/me/${id}/plan`,
  CANCEL: (id: string) => `/subscription/me/${id}`,
  RESUME: (id: string) => `/subscription/me/${id}/resume`,
} as const;