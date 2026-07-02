import { PAYMENT_ENDPOINTS } from "./endpoints";
import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";
import type {
  Payment,
  PaymentDetails,
  PaymentsResponse,
  PaymentsFilters,
  CreateManualPaymentDto,
  CancelPaymentDto,
} from "../types";

// ─── Payments Service ─────────────────────────────────────────────

export const paymentsService = {
  async createManualPayment(data: CreateManualPaymentDto): Promise<Payment> {
    logger.log("PAYMENTS", "Creating manual payment - started");
    const res = await apiClient.post<Payment>(
      PAYMENT_ENDPOINTS.CREATE,
      data,
    );
    logger.log("PAYMENTS", "Creating manual payment - success");
    return res.data;
  },

  async getPayments(params: PaymentsFilters): Promise<PaymentsResponse> {
    logger.log("PAYMENTS", "Fetch payments - started");
    const res = await apiClient.get<PaymentsResponse>(
      PAYMENT_ENDPOINTS.FIND_ALL,
      { params },
    );
    logger.log("PAYMENTS", "Fetch payments - success");
    return res.data;
  },

  async getPaymentById(id: string): Promise<PaymentDetails> {
    logger.log("PAYMENTS", `Fetch payment ${id} - started`);
    const res = await apiClient.get<PaymentDetails>(
      PAYMENT_ENDPOINTS.FIND_ONE(id),
    );
    logger.log("PAYMENTS", `Fetch payment ${id} - success`);
    return res.data;
  },

  async cancelPayment(id: string, data: CancelPaymentDto): Promise<{ message: string }> {
    logger.log("PAYMENTS", `Cancel payment ${id} - started`);
    const res = await apiClient.patch<{ message: string }>(
      PAYMENT_ENDPOINTS.CANCEL(id),
      data,
    );
    logger.log("PAYMENTS", `Cancel payment ${id} - success`);
    return res.data;
  },
};