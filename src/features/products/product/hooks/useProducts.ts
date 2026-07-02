import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Product,
  Products,
  ProductsFilters,
  ProductPayload,
} from "../types";
import { productService } from "../api/products.service";
import { useAppSelector } from "@/core/store/hooks";

// ─── useProducts ───────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Product, Error, ProductPayload>({
    mutationFn: (data) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["products", currentOrganizationId],
      });
    },
  });
}
export function useGetProducts(params: ProductsFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  return useQuery<Products, Error>({
    queryKey: ["products", currentOrganizationId, params],
    enabled: !!currentOrganizationId,
    queryFn: async () => {
      const response = await productService.getProducts(params);
      return response;
    },
  });
}

export function useGetProductById(id: string) {
  return useQuery<Product, Error>({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await productService.getProductById(id);
      return response;
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Product, Error, ProductPayload>({
    mutationFn: (data) => productService.updateProduct(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({
        queryKey: ["products", currentOrganizationId],
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({
        queryKey: ["products", currentOrganizationId],
      });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Product, Error, string>({
    mutationFn: (id: string) => productService.restoreProduct(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({
        queryKey: ["products", currentOrganizationId],
      });
    },
  });
}
