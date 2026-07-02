import { apiClient } from "../../../core/api/client";
import { ORGANIZATION_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import type { Organization, OrganizationMembership } from "../types";


export interface CreateOrgDto { name: string; address?: string; contactEmail: string; contactPhone?: string; }
export interface UpdateOrgDto extends Partial<CreateOrgDto> {}

// ─── Organization Service ─────────────────────────────────────────────────

export const organizationService = {
  async createOrganization(data: CreateOrgDto): Promise<Organization> {
    logger.log("ORGANIZATION", "Create organization started");
    const res = await apiClient.post<Organization>(
      ORGANIZATION_ENDPOINTS.CREATE,
      data,
    );
    logger.log("ORGANIZATION", "Create organization success");
    return res.data;
  },
  async getOrganization(): Promise<Organization> {
    logger.log("ORGANIZATION", "Fetch organization started");
    const res = await apiClient.get<Organization>(
      ORGANIZATION_ENDPOINTS.FIND_ONE,
    );
    logger.log("ORGANIZATION", "Fetch organization success");
    return res.data;
  },

  async getOrganizationsByUserId(): Promise<OrganizationMembership[]> {
    logger.log(
      "ORGANIZATION",
      `Fetch organizations for user started`,
    );
    const res = await apiClient.get<OrganizationMembership[]>(
      ORGANIZATION_ENDPOINTS.GET_ORGANIZATIONS_BY_USER_ID,
    );
    logger.log("ORGANIZATION", "Fetch organizations success");
    return res.data;
  },

  async updateOrganization(data: UpdateOrgDto): Promise<Organization> {
    logger.log("ORGANIZATION", "Update organization started");
    const res = await apiClient.patch<Organization>(
      ORGANIZATION_ENDPOINTS.UPDATE,
      data,
    );
    logger.log("ORGANIZATION", "Update organization success");
    return res.data;
  }
};
