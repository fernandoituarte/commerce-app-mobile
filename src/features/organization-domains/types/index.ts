// ─── Organization Domain Types ────────────────────────────────────

export type OrganizationDomainsResponse = OrganizationDomain[] | {
  items: OrganizationDomain[];
};


export interface OrganizationDomain {
  id:             string;
  organizationId: string;
  domain:         string;
  createdAt:      Date;
  updatedAt:      Date;
}

export interface CreateOrganizationDomainDto {
  domain: string;
}

export interface UpdateOrganizationDomainDto {
  domain?: string;
}