import { apiClient } from "@/core/api/client";
import { logger } from "@/core/config/logger";
import type { StripeConnectResponse } from "../types";

export const stripeConnectService = {
  async connectAccount(): Promise<StripeConnectResponse> {
    logger.log("STRIPE", "Connect account - started");
    const res = await apiClient.post<StripeConnectResponse>("/connect/account");
    logger.log("STRIPE", "Connect account - success");
    return res.data;
  },
};