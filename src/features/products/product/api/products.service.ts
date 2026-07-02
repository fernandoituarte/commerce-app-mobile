import { PRODUCTS_ENDPOINTS } from "./endpoints";
import { Product, Products, ProductsFilters, ProductPayload } from "../types";
import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";

// ─── Product Service ─────────────────────────────────────────────────

export const productService = {
  async createProduct(data: ProductPayload): Promise<Product> {
    logger.log("PRODUCT", "Creating product - started");
    const res = await apiClient.post<Product>(
      PRODUCTS_ENDPOINTS.CREATE,
      data,
    );
    logger.log("PRODUCT", "Creating product - success");
    return res.data;
  },

  async getProducts(params: ProductsFilters): Promise<Products> {
    logger.log("PRODUCT", "Fetch products started");
    const res = await apiClient.get<Products>(PRODUCTS_ENDPOINTS.FIND_ALL, {
      params,
    });
    logger.log("PRODUCT", "Fetch products success");
    return res.data;
  },

  async getProductById(id: string): Promise<Product> {
    logger.log("PRODUCT", `Fetch Product with id: ${id} started`);
    const res = await apiClient.get<Product>(
      PRODUCTS_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("PRODUCT", `Fetch Product with id: ${id} success`);
    return res.data;
  },

  async updateProduct(id: string, data: ProductPayload): Promise<Product> {
    logger.log("PRODUCT", `Update product with id: ${id} started`);
    const res = await apiClient.patch<Product>(
      PRODUCTS_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("PRODUCT", `Update product with id: ${id} success`);
    return res.data;
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    logger.log("PRODUCT", `Soft-delete product with id: ${id} started`);
    const res = await apiClient.patch<{ message: string }>(
      PRODUCTS_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("PRODUCT", `Soft-delete product with id: ${id} success`);
    return res.data;
  },

  async restoreProduct(id: string): Promise<Product> {
    logger.log("PRODUCT", `Restore product with id: ${id} started`);
    const res = await apiClient.patch<Product>(
      PRODUCTS_ENDPOINTS.RESTORE(id),
    );
    logger.log("PRODUCT", `Restore product with id: ${id} success`);
    return res.data;
  },
};
