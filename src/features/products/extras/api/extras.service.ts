import { EXTRAS_ENDPOINTS } from "./endpoints";

import { Extra, Extras, ExtrasFilters } from "../types";
import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";


export interface CreateExtraDto {
  name:   string;
  price?: number;
}
export interface UpdateExtraDto extends Partial<CreateExtraDto> {}

// ─── Extra Service ─────────────────────────────────────────────────

export const extraService = {
  async createExtra(data: CreateExtraDto): Promise<Extra> {
    logger.log("EXTRA", "Creating Extra - started");
    const res = await apiClient.post<Extra>(
      EXTRAS_ENDPOINTS.CREATE,
      data,
    );
    logger.log("EXTRA", "Creating Extra - success");
    return res.data;
  },

  async getExtras(params: ExtrasFilters): Promise<Extras> {
    logger.log("EXTRAS", "Fetch extras started");
    const res = await apiClient.get<Extras>(EXTRAS_ENDPOINTS.FIND_ALL, {
      params,
    });
    logger.log("EXTRAS", "Fetch extras success");
    return res.data;
  },

  async getExtraById(id: string): Promise<Extra> {
    logger.log("Extra", `Fetch Extra with id: ${id} started`);
    const res = await apiClient.get<Extra>(
      EXTRAS_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("Extra", `Fetch Extra with id: ${id} success`);
    return res.data;
  },

  async updateExtra(id: string, data: UpdateExtraDto): Promise<Extra> {
    logger.log("Extra", `Update Extra with id: ${id} started`);
    const res = await apiClient.patch<Extra>(
      EXTRAS_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("Extra", `Update Extra with id: ${id} success`);
    return res.data;
  },

  async deleteExtra(id: string): Promise<{ message: string }> {
    logger.log("Extra", `Soft-delete Extra with id: ${id} started`);
    const res = await apiClient.patch<{ message: string }>(
      EXTRAS_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("Extra", `Soft-delete Extra with id: ${id} success`);
    return res.data;
  },

  async restoreExtra(id: string): Promise<Extra> {
    logger.log("Extra", `Restore Extra with id: ${id} started`);
    const res = await apiClient.patch<Extra>(
      EXTRAS_ENDPOINTS.RESTORE(id),
    );
    logger.log("Extra", `Restore Extra with id: ${id} success`);
    return res.data;
  },
};
