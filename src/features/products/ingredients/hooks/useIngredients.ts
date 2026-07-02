import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Ingredient, Ingredients, IngredientsFilters } from "../types";
import {
  CreateIngredientDto,
  ingredientService,
  UpdateIngredientDto,
} from "../api/ingredients.service";
import { useAppSelector } from "@/core/store/hooks";

// ─── useIngredients ───────────────────────────────────────────────

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Ingredient, Error, CreateIngredientDto>({
    mutationFn: (data) => ingredientService.createIngredient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ingredients", currentOrganizationId],
      });
    },
  });
}

export function useGetIngredients(params: IngredientsFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  return useQuery<Ingredients, Error>({
    queryKey: ["ingredients", currentOrganizationId, params],
    enabled: !!currentOrganizationId,
    queryFn: async () => {
      const response = await ingredientService.getIngredients(params);
      return response;
    },
  });
}

export function useGetIngredientById(id: string) {
  return useQuery<Ingredient, Error>({
    queryKey: ["ingredient", id],
    queryFn: async () => {
      const response = await ingredientService.getIngredientById(id);
      return response;
    },
  });
}

export function useUpdateIngredient(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Ingredient, Error, UpdateIngredientDto>({
    mutationFn: (data) => ingredientService.updateIngredient(id, data),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["ingredient", id] });
      queryClient.invalidateQueries({
        queryKey: ["ingredients", currentOrganizationId],
      });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<any, Error, string>({
    mutationFn: (id: string) => ingredientService.deleteIngredient(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["ingredient", id] });
      queryClient.invalidateQueries({
        queryKey: ["ingredients", currentOrganizationId],
      });
    },
  });
}

export function useRestoreIngredient() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Ingredient, Error, string>({
    mutationFn: (id: string) => ingredientService.restoreIngredient(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["ingredient", id] });
      queryClient.invalidateQueries({
        queryKey: ["ingredients", currentOrganizationId],
      });
    },
  });
}
