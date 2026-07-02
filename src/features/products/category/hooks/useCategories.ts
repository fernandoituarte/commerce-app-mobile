import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Categories, CategoriesFilters, Category } from "../types";
import {
  categoryService,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../api/categories.service";
import { useAppSelector } from "@/core/store/hooks";

// ─── useCategories ───────────────────────────────────────────────

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Category, Error, CreateCategoryDto>({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories", currentOrganizationId],
      });
    },
  });
}
export function useGetCategories(params: CategoriesFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  return useQuery<Categories, Error>({
    queryKey: ["categories", currentOrganizationId, params],
    enabled: !!currentOrganizationId,
    queryFn: async () => {
      const response = await categoryService.getCategories(params);
      return response;
    },
  });
}

export function useGetCategoryById(id: string) {
  return useQuery<Category, Error>({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await categoryService.getCategoryById(id);
      return response;
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Category, Error, UpdateCategoryDto>({
    mutationFn: (data) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      queryClient.invalidateQueries({
        queryKey: ["categories", currentOrganizationId],
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      queryClient.invalidateQueries({
        queryKey: ["categories", currentOrganizationId],
      });
    },
  });
}

export function useRestoreCategory() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  return useMutation<Category, Error, string>({
    mutationFn: (id: string) => categoryService.restoreCategory(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["category", id] });
      queryClient.invalidateQueries({
        queryKey: ["categories", currentOrganizationId],
      });
    },
  });
}
