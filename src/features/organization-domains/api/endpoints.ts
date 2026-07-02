// ─── Organization Domains API Endpoint Constants ──────────────────

export const ORGANIZATION_DOMAIN_ENDPOINTS = {
  FIND_ALL:   "/organization-domains",
  CREATE:     "/organization-domains",
  FIND_ONE:   (domain: string) => `/organization-domains/${domain}`,
  UPDATE:     (id: string) => `/organization-domains/${id}`,
  DELETE:     (id: string) => `/organization-domains/${id}`,
} as const;