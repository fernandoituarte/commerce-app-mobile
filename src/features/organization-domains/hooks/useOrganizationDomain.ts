import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/core/store/hooks";
import type {
  OrganizationDomain,
  OrganizationDomainsResponse,
  CreateOrganizationDomainDto,
  UpdateOrganizationDomainDto,
} from "../types";
import { organizationDomainsService } from "../api/organization-domains.service";

const DOMAINS_KEY = "organization-domains";

// ─── useGetDomains ────────────────────────────────────────────────

export function useGetDomains() {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useQuery<OrganizationDomainsResponse, Error>({
    queryKey: [DOMAINS_KEY, currentOrganizationId],
    enabled: Boolean(currentOrganizationId),
    queryFn: () => organizationDomainsService.getDomains(),
  });
}

// ─── useCreateDomain ──────────────────────────────────────────────

export function useCreateDomain() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<OrganizationDomain, Error, CreateOrganizationDomainDto>({
    mutationFn: (data) => organizationDomainsService.createDomain(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DOMAINS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useUpdateDomain ──────────────────────────────────────────────

export function useUpdateDomain(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<OrganizationDomain, Error, UpdateOrganizationDomainDto>({
    mutationFn: (data) => organizationDomainsService.updateDomain(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DOMAINS_KEY, currentOrganizationId],
      });
    },
  });
}

// ─── useDeleteDomain ──────────────────────────────────────────────

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id) => organizationDomainsService.deleteDomain(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DOMAINS_KEY, currentOrganizationId],
      });
    },
  });
}