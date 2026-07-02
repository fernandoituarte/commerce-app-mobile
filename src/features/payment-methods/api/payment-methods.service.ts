import { PAYMENT_METHODS_ENDPOINTS } from "./endpoints";
import { PaymentMethod, PaymentMethodsResponse, PaymentMethodsFilters, CreatePaymentMethodDto, UpdatePaymentMethodDto } from "../types";
import { logger } from "@/core/config/logger";
import { apiClient } from "@/core/api/client";

// ─── Payment Methods Service ──────────────────────────────────────────────

export const paymentMethodsService = {
  async createPaymentMethod(data: CreatePaymentMethodDto): Promise<PaymentMethod> {
    logger.log("PAYMENT_METHODS", "Creating payment method - started");
    const res = await apiClient.post<PaymentMethod>(
      PAYMENT_METHODS_ENDPOINTS.CREATE,
      data,
    );
    logger.log("PAYMENT_METHODS", "Creating payment method - success");
    return res.data;
  },

  async getPaymentMethods(params: PaymentMethodsFilters): Promise<PaymentMethodsResponse> {
    logger.log("PAYMENT_METHODS", "Fetch payment methods - started");
    const res = await apiClient.get<PaymentMethodsResponse>(
      PAYMENT_METHODS_ENDPOINTS.FIND_ALL,
      { params },
    );
    logger.log("PAYMENT_METHODS", "Fetch payment methods - success");
    return res.data;
  },

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    logger.log("PAYMENT_METHODS", `Fetch payment method with id: ${id} - started`);
    const res = await apiClient.get<PaymentMethod>(
      PAYMENT_METHODS_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("PAYMENT_METHODS", `Fetch payment method with id: ${id} - success`);
    return res.data;
  },

  async updatePaymentMethod(id: string, data: UpdatePaymentMethodDto): Promise<PaymentMethod> {
    logger.log("PAYMENT_METHODS", `Update payment method with id: ${id} - started`);
    const res = await apiClient.patch<PaymentMethod>(
      PAYMENT_METHODS_ENDPOINTS.UPDATE(id),
      data,
    );
    logger.log("PAYMENT_METHODS", `Update payment method with id: ${id} - success`);
    return res.data;
  },

  async deletePaymentMethod(id: string): Promise<{ message: string }> {
    logger.log("PAYMENT_METHODS", `Soft-delete payment method with id: ${id} - started`);
    const res = await apiClient.patch<{ message: string }>(
      PAYMENT_METHODS_ENDPOINTS.SOFT_DELETE(id),
    );
    logger.log("PAYMENT_METHODS", `Soft-delete payment method with id: ${id} - success`);
    return res.data;
  },

  async restorePaymentMethod(id: string): Promise<PaymentMethod> {
    logger.log("PAYMENT_METHODS", `Restore payment method with id: ${id} - started`);
    const res = await apiClient.patch<PaymentMethod>(
      PAYMENT_METHODS_ENDPOINTS.RESTORE(id),
    );
    logger.log("PAYMENT_METHODS", `Restore payment method with id: ${id} - success`);
    return res.data;
  },
};