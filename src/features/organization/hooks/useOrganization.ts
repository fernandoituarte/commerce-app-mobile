import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "../../../core/store/hooks";
import type { Organization, OrganizationMembership } from "../types";
import { setCurrentOrganizationId, setOrganization } from "../store/organizationSlice";
import { CreateOrgDto, organizationService, UpdateOrgDto } from "../api/organization.service";

// ─── useOrganization ───────────────────────────────────────────────

export function useCreateOrganization() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<Organization, Error, CreateOrgDto>({
    mutationFn: (data) => organizationService.createOrganization(data),
    onSuccess: (response) => {
      dispatch(setCurrentOrganizationId(response.id));
      dispatch(setOrganization(response));
      queryClient.invalidateQueries({ queryKey: ["organization", "details"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", "user"] });
    },
  });
}
export function useGetOrganization(id: string) {
  const dispatch = useAppDispatch();
  const { data: memberships } = useOrganizationsByUserId();
  const idToFetch = id || memberships?.[0]?.organization.id || "";

  return useQuery<Organization, Error>({
    queryKey: ["organization", "details", idToFetch],
    queryFn: async () => {
      const response = await organizationService.getOrganization();
      dispatch(setOrganization(response));
      return response;
    },
    enabled: !!idToFetch,
  });
}

export function useOrganizationsByUserId() {
  return useQuery<OrganizationMembership[], Error>({
    queryKey: ["organizations", "user"],
    queryFn: async () => {
      const response = await organizationService.getOrganizationsByUserId();
      return response;
    },
  });
}

export function useUpdateOrganization() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation<Organization, Error, UpdateOrgDto>({
    mutationFn: (data) => {
      return organizationService.updateOrganization(data);
    },
    onSuccess: (response) => {
      dispatch(setOrganization(response));
      queryClient.invalidateQueries({ queryKey: ["organization", "details"] });
      queryClient.invalidateQueries({ queryKey: ["organizations", "user"] });
    },
  });
}
