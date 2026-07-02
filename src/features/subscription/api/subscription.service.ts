import { apiClient } from "../../../core/api/client";
import { SUBSCRIPTION_ENDPOINTS } from "./endpoints";
import { logger } from "../../../core/config/logger";
import type {
  CreateOnboardingSessionDto,
  CreateOnboardingSessionResponse,
  InvoiceHistoryItem,
  Plan,
  Subscription,
  SubscriptionPlan,
} from "../types";

export const subscriptionService = {
  async getPlans(): Promise<Plan[]> {
    logger.log("SUBSCRIPTION", "Fetch plans started");
    const res = await apiClient.get<Plan[]>(SUBSCRIPTION_ENDPOINTS.PLANS);
    logger.log("SUBSCRIPTION", `Fetch plans success (${res.data.length})`);
    return res.data;
  },

  async getSubscription(): Promise<Subscription | null> {
    logger.log("SUBSCRIPTION", "Fetch subscription started");
    const res = await apiClient.get<Subscription | null>(
      SUBSCRIPTION_ENDPOINTS.GET_SUBSCRIPTION,
    );
    logger.log(
      "SUBSCRIPTION",
      res.data ? "Fetch subscription success" : "Fetch subscription: none",
    );
    return res.data;
  },

  async getSubscriptionHistory(): Promise<InvoiceHistoryItem[]> {
    logger.log("SUBSCRIPTION", "Fetch invoice history started");
    const res = await apiClient.get<InvoiceHistoryItem[]>(
      SUBSCRIPTION_ENDPOINTS.GET_SUBSCRIPTION_HISTORY,
    );
    logger.log(
      "SUBSCRIPTION",
      `Fetch invoice history success (${res.data.length})`,
    );
    return res.data;
  },

  async createOnboardingSubscriptionSession(
    data: CreateOnboardingSessionDto,
  ): Promise<CreateOnboardingSessionResponse> {
    logger.log("SUBSCRIPTION", "Create onboarding session started");
    const res = await apiClient.post<CreateOnboardingSessionResponse>(
      SUBSCRIPTION_ENDPOINTS.CREATE_ONBOARDING_SESSION,
      data,
    );
    logger.log(
      "SUBSCRIPTION",
      res.data.alreadyActive
        ? "Create onboarding session: already active"
        : "Create onboarding session success",
    );
    return res.data;
  },

  async changePlan(id: string, plan: SubscriptionPlan): Promise<Subscription> {
    logger.log("SUBSCRIPTION", `Change plan started (${plan})`);
    const res = await apiClient.patch<Subscription>(
      SUBSCRIPTION_ENDPOINTS.CHANGE_PLAN(id),
      { plan },
    );
    logger.log("SUBSCRIPTION", "Change plan success");
    return res.data;
  },

  async cancel(id: string): Promise<Subscription> {
    logger.log("SUBSCRIPTION", "Cancel started");
    const res = await apiClient.delete<Subscription>(
      SUBSCRIPTION_ENDPOINTS.CANCEL(id),
    );
    logger.log("SUBSCRIPTION", "Cancel success");
    return res.data;
  },

  async resume(id: string): Promise<Subscription> {
    logger.log("SUBSCRIPTION", "Resume started");
    const res = await apiClient.patch<Subscription>(
      SUBSCRIPTION_ENDPOINTS.RESUME(id),
    );
    logger.log("SUBSCRIPTION", "Resume success");
    return res.data;
  },
};
