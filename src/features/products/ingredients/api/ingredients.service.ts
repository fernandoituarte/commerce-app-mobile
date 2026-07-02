import { INGREDIENTS_ENDPOINTS } from "./endpoints";

import { Ingredient, Ingredients, IngredientsFilters } from "../types";
import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";


export interface CreateIngredientDto { name: string; }
export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {}

// ─── Ingredient Service ─────────────────────────────────────────────────

export const ingredientService = {
async createIngredient(data: CreateIngredientDto): Promise<Ingredient> {
    logger.log("Ingredient", "Creating Ingredient - started");
    const res = await apiClient.post<Ingredient>(
      INGREDIENTS_ENDPOINTS.CREATE,
      data,
    );
    logger.log("Ingredient", "Creating Ingredient - success");
    return res.data;
  },

  async getIngredients(params: IngredientsFilters): Promise<Ingredients> {
    logger.log("IngredientS", "Fetch Ingredients started");
    const res = await apiClient.get<Ingredients>(INGREDIENTS_ENDPOINTS.FIND_ALL, {
      params,
    });
    logger.log("IngredientS", "Fetch Ingredients success");
    return res.data;
  },

  async getIngredientById(id: string): Promise<Ingredient> {
    logger.log("Ingredient", `Fetch Ingredient with id: ${id} started`);
    const res = await apiClient.get<Ingredient>(
      INGREDIENTS_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("Ingredient", `Fetch Ingredient with id: ${id} success`);
    return res.data;
  },

  async updateIngredient(id: string, data: UpdateIngredientDto): Promise<Ingredient> {
    logger.log("Ingredient", `Update Ingredient with id: ${id} started`);
    const res = await apiClient.patch<Ingredient>(
      INGREDIENTS_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("Ingredient", `Update Ingredient with id: ${id} success`);
    return res.data;
  },

  async deleteIngredient(id: string): Promise<{ message: string }> {
    logger.log("Ingredient", `Soft-delete Ingredient with id: ${id} started`);
    const res = await apiClient.patch<{ message: string }>(
      INGREDIENTS_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("Ingredient", `Soft-delete Ingredient with id: ${id} success`);
    return res.data;
  },

  async restoreIngredient(id: string): Promise<Ingredient> {
    logger.log("Ingredient", `Restore Ingredient with id: ${id} started`);
    const res = await apiClient.patch<Ingredient>(
      INGREDIENTS_ENDPOINTS.RESTORE(id),
    );
    logger.log("Ingredient", `Restore Ingredient with id: ${id} success`);
    return res.data;
  },
};
