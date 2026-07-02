import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
import { useAppDispatch } from "../../../core/store/hooks";
import type {
  CreateOnboardingSessionDto,
  Plan,
  Subscription,
  SubscriptionPlan,
  InvoiceHistoryItem,
} from "../types";
import { subscriptionService } from "../api/subscription.service";
import { setSubscription } from "../store/subscriptionSlice";

const SUB_KEY = ["subscription", "details"] as const;

// ─── Queries ──────────────────────────────────────────────────────

export function usePlans() {
  return useQuery<Plan[], Error>({
    queryKey: ["subscription", "plans"],
    queryFn: () => subscriptionService.getPlans(),
    staleTime: 1000 * 60 * 10, // los precios casi no cambian
  });
}

export function useSubscription() {
  const dispatch = useAppDispatch();

  return useQuery<Subscription | null, Error>({
    queryKey: SUB_KEY,
    queryFn: async () => {
      const response = await subscriptionService.getSubscription();
      if (response) dispatch(setSubscription(response));
      return response;
    },
  });
}

export function useSubscriptionHistory() {
  return useQuery<InvoiceHistoryItem[], Error>({
    queryKey: ["subscription", "history"],
    queryFn: () => subscriptionService.getSubscriptionHistory(),
  });
}

// ─── Onboarding / create session ──────────────────────────────────

export function useCreateSubscriptionSession() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: CreateOnboardingSessionDto) => {
      const res =
        await subscriptionService.createOnboardingSubscriptionSession(data);
      if (res.alreadyActive) {
        await queryClient.invalidateQueries({ queryKey: SUB_KEY });
        return res;
      }
      if (res.checkoutUrl) {
        const result = await WebBrowser.openAuthSessionAsync(
          res.checkoutUrl,
          "commerce-app://subscription/success",
        );
        if (result.type === "success" || result.type === "dismiss") {
          await pollUntilActive(queryClient, dispatch);
        }
      }
      return res;
    },
  });
}

// ─── Manage subscription ──────────────────────────────────────────

export function useChangePlan() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: SubscriptionPlan }) =>
      subscriptionService.changePlan(id, plan),
    onSuccess: (sub) => {
      queryClient.setQueryData(SUB_KEY, sub);
      dispatch(setSubscription(sub));
      void queryClient.invalidateQueries({ queryKey: SUB_KEY });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.cancel(id),
    onSuccess: (sub) => {
      queryClient.setQueryData(SUB_KEY, sub);
      dispatch(setSubscription(sub));
      void queryClient.invalidateQueries({ queryKey: SUB_KEY });
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (id: string) => subscriptionService.resume(id),
    onSuccess: (sub) => {
      queryClient.setQueryData(SUB_KEY, sub);
      dispatch(setSubscription(sub));
      void queryClient.invalidateQueries({ queryKey: SUB_KEY });
    },
  });
}

async function pollUntilActive(
  queryClient: ReturnType<typeof useQueryClient>,
  dispatch: ReturnType<typeof useAppDispatch>,
  attempts = 8,
  delayMs = 1500,
): Promise<Subscription | null> {
  for (let i = 0; i < attempts; i++) {
    const sub = await subscriptionService.getSubscription().catch(() => null);
    if (sub) {
      queryClient.setQueryData(SUB_KEY, sub);
      dispatch(setSubscription(sub));
      if (sub.status === "ACTIVE") return sub;
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return queryClient.getQueryData<Subscription>(SUB_KEY) ?? null;
}
