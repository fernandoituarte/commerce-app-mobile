import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Extra, Extras, ExtrasFilters } from "../types";
import {
  CreateExtraDto,
  extraService,
  UpdateExtraDto,
} from "../api/extras.service";
import { useAppSelector } from "@/core/store/hooks";

// ─── useExtras ───────────────────────────────────────────────

export function useCreateExtra() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Extra, Error, CreateExtraDto>({
    mutationFn: (data) => extraService.createExtra(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["extras", currentOrganizationId],
      });
    },
  });
}

export function useGetExtras(params: ExtrasFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  return useQuery<Extras, Error>({
    queryKey: ["extras", currentOrganizationId, params],
    enabled: !!currentOrganizationId,
    queryFn: async () => {
      const response = await extraService.getExtras(params);
      return response;
    },
  });
}

export function useGetExtraById(id: string) {
  return useQuery<Extra, Error>({
    queryKey: ["extra", id],
    queryFn: async () => {
      const response = await extraService.getExtraById(id);
      return response;
    },
  });
}

export function useUpdateExtra(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Extra, Error, UpdateExtraDto>({
    mutationFn: (data) => extraService.updateExtra(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extra", id] });
      queryClient.invalidateQueries({
        queryKey: ["extras", currentOrganizationId],
      });
    },
  });
}

export function useDeleteExtra() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id) => extraService.deleteExtra(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["extra", id] });
      queryClient.invalidateQueries({
        queryKey: ["extras", currentOrganizationId],
      });
    },
  });
}
export function useRestoreExtra() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Extra, Error, string>({
    mutationFn: (id: string) => extraService.restoreExtra(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["extra", id] });
      queryClient.invalidateQueries({
        queryKey: ["extras", currentOrganizationId],
      });
    },
  });
}
