// ─── Organization API Endpoint Constants ──────────────────────────────────

export const ORGANIZATION_ENDPOINTS = {
  CREATE: "/organization",
  FIND_ONE: `/organization`,
  GET_ORGANIZATIONS_BY_USER_ID: "/memberships/user/organizations",
  UPDATE: `/organization`,
} as const;
