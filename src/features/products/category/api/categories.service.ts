import { CATEGORIES_ENDPOINTS } from "./endpoints";

import { Categories, CategoriesFilters, Category } from "../types";
import { logger } from "@/core/config/logger";
import { apiClient } from "@/core/api/client";

export interface CreateCategoryDto {
  name: string;
  description?: string;
  ui?: {
    backgroundColor?: string;
    textColor?: string;
    badge?: string;
    highlight?: boolean;
    sortOrder?: number;
  };
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

// ─── Category Service ─────────────────────────────────────────────────

export const categoryService = {
  async createCategory(data: CreateCategoryDto): Promise<Category> {
    logger.log("CATEGORIES", "Creating category - started");
    const res = await apiClient.post<Category>(
      CATEGORIES_ENDPOINTS.CREATE,
      data,
    );
    logger.log("CATEGORIES", "Creating category - success");
    return res.data;
  },

  async getCategories(params: CategoriesFilters): Promise<Categories> {
    logger.log("CATEGORIES", "Fetch categories started");
    const res = await apiClient.get<Categories>(CATEGORIES_ENDPOINTS.FIND_ALL, {
      params,
    });
    logger.log("CATEGORIES", "Fetch categories success");
    return res.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    logger.log("CATEGORY", `Fetch category with id: ${id} started`);
    const res = await apiClient.get<Category>(
      CATEGORIES_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("CATEGORY", `Fetch category with id: ${id} success`);
    return res.data;
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    logger.log("CATEGORY", `Update category with id: ${id} started`);
    const res = await apiClient.patch<Category>(
      CATEGORIES_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("CATEGORY", `Update category with id: ${id} success`);
    return res.data;
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    logger.log("CATEGORY", `Soft-delete category with id: ${id} started`);
    const res = await apiClient.patch<{ message: string }>(
      CATEGORIES_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("CATEGORY", `Soft-delete category with id: ${id} success`);
    return res.data;
  },

  async restoreCategory(id: string): Promise<Category> {
    logger.log("CATEGORY", `Restore category with id: ${id} started`);
    const res = await apiClient.patch<Category>(
      CATEGORIES_ENDPOINTS.RESTORE(id),
    );
    logger.log("CATEGORY", `Restore category with id: ${id} success`);
    return res.data;
  },
};
