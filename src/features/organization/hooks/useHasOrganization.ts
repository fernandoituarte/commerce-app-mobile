import { useAppSelector } from "@/core/store/hooks";
import { useOrganizationsByUserId } from "./useOrganization";

export interface HasOrganizationResult {
  hasOrganization: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

export function useHasOrganization(): HasOrganizationResult {
  const { data, isLoading, isFetching, refetch } = useOrganizationsByUserId();

  // useCreateOrganization.onSuccess dispatches setCurrentOrganizationId
  // synchronously — before router.replace fires and before the React Query
  // cache refetch settles. Checking the Redux value here prevents the gate
  // from briefly re-triggering during that window.
  const currentOrganizationId = useAppSelector(
    (s) => s.organization.currentOrganizationId,
  );

  const hasOrganization =
    (data?.length ?? 0) > 0 || !!currentOrganizationId;

  return { hasOrganization, isLoading, isFetching, refetch };
}
