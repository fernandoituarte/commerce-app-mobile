import { getSubscriptionAccess, type SubscriptionAccessLevel } from "../utils/subscriptionAccess";
import { useSubscription } from "./useSubscription";

export interface SubscriptionAccess {
  level: SubscriptionAccessLevel;
  canWrite: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

export function useSubscriptionAccess(): SubscriptionAccess {
  const { data, isLoading, isFetching, refetch } = useSubscription();
  const level = getSubscriptionAccess(data?.status);
  return {
    level,
    canWrite: level === "full",
    isLoading,
    isFetching,
    refetch,
  };
}
