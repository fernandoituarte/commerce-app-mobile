import { ORGANIZATION_DOMAIN_ENDPOINTS } from "./endpoints";
import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";
import type {
  OrganizationDomain,
  OrganizationDomainsResponse,
  CreateOrganizationDomainDto,
  UpdateOrganizationDomainDto,
} from "../types";

// ─── Organization Domains Service ────────────────────────────────

export const organizationDomainsService = {
  async getDomains(): Promise<OrganizationDomainsResponse> {
    logger.log("DOMAINS", "Fetch domains - started");
    const res = await apiClient.get<OrganizationDomainsResponse>(
      ORGANIZATION_DOMAIN_ENDPOINTS.FIND_ALL,
    );
    logger.log("DOMAINS", "Fetch domains - success");
    return res.data;
  },

  async getDomainByName(domain: string): Promise<OrganizationDomain> {
    logger.log("DOMAINS", `Fetch domain ${domain} - started`);
    const res = await apiClient.get<OrganizationDomain>(
      ORGANIZATION_DOMAIN_ENDPOINTS.FIND_ONE(domain),
    );
    logger.log("DOMAINS", `Fetch domain ${domain} - success`);
    return res.data;
  },

  async createDomain(data: CreateOrganizationDomainDto): Promise<OrganizationDomain> {
    logger.log("DOMAINS", "Creating domain - started");
    const res = await apiClient.post<OrganizationDomain>(
      ORGANIZATION_DOMAIN_ENDPOINTS.CREATE,
      data,
    );
    logger.log("DOMAINS", "Creating domain - success");
    return res.data;
  },

  async updateDomain(id: string, data: UpdateOrganizationDomainDto): Promise<OrganizationDomain> {
    logger.log("DOMAINS", `Update domain ${id} - started`);
    const res = await apiClient.patch<OrganizationDomain>(
      ORGANIZATION_DOMAIN_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("DOMAINS", `Update domain ${id} - success`);
    return res.data;
  },

  async deleteDomain(id: string): Promise<{ message: string }> {
    logger.log("DOMAINS", `Delete domain ${id} - started`);
    const res = await apiClient.delete<{ message: string }>(
      ORGANIZATION_DOMAIN_ENDPOINTS.DELETE(id),
    );
    logger.log("DOMAINS", `Delete domain ${id} - success`);
    return res.data;
  },
};