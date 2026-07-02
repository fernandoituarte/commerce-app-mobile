import { TAGS_ENDPOINTS } from "./endpoints";

import { Tag, Tags, TagsFilters } from "../types";
import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";

export interface CreateTagDto {
  name: string;
  ui?: {
    backgroundColor?: string;
    textColor?:       string;
    badge?:           string;
    highlight?:       boolean;
    sortOrder?:       number;
  };
}
export interface UpdateTagDto extends Partial<CreateTagDto> {}

// ─── Tag Service ─────────────────────────────────────────────────

export const tagService = {
  async createTag(data: CreateTagDto): Promise<Tag> {
    logger.log("TAG", "Creating tag - started");
    const res = await apiClient.post<Tag>(
      TAGS_ENDPOINTS.CREATE,
      data,
    );
    logger.log("TAG", "Creating tag - success");
    return res.data;
  },

  async getTags(params: TagsFilters): Promise<Tags> {
    logger.log("TAG", "Fetch tags started");
    const res = await apiClient.get<Tags>(TAGS_ENDPOINTS.FIND_ALL, {
      params,
    });
    logger.log("TAG", "Fetch tags success");
    return res.data;
  },

  async getTagById(id: string): Promise<Tag> {
    logger.log("TAG", `Fetch tag with id: ${id} started`);
    const res = await apiClient.get<Tag>(
      TAGS_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("TAG", `Fetch tag with id: ${id} success`);
    return res.data;
  },

  async updateTag(id: string, data: UpdateTagDto): Promise<Tag> {
    logger.log("TAG", `Update tag with id: ${id} started`);
    const res = await apiClient.patch<Tag>(
      TAGS_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("TAG", `Update tag with id: ${id} success`);
    return res.data;
  },

  async deleteTag(id: string): Promise<{ message: string }> {
    logger.log("TAG", `Soft-delete tag with id: ${id} started`);
    const res = await apiClient.patch<{ message: string }>(
      TAGS_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("TAG", `Soft-delete tag with id: ${id} success`);
    return res.data;
  },

  async restoreTag(id: string): Promise<Tag> {
    logger.log("TAG", `Restore tag with id: ${id} started`);
    const res = await apiClient.patch<Tag>(
      TAGS_ENDPOINTS.RESTORE(id),
    );
    logger.log("TAG", `Restore tag with id: ${id} success`);
    return res.data;
  },
};
