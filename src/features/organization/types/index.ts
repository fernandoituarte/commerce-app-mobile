// ─── Organization Types ───────────────────────────────────────────

export type MemberRole = "customer" | "staff";

export interface OrganizationMembership {
  membershipId: string;
  role: MemberRole;
  organization: Pick<
    Organization,
    "id" | "name" | "address" | "logoUrl" | "contactEmail" | "contactPhone"
  >;
}

export interface Organization {
  id:               string;
  name:             string;
  contactEmail:     string;
  ownerId:          string;
  createdAt:        string;
  updatedAt:        string;
  deletedAt:        string | null;
  address?:         string;
  logoUrl?:         string;
  contactPhone?:    string;
  stripeAccountId?: string;
}

