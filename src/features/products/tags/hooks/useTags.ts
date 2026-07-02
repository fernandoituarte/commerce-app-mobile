import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Tag, Tags, TagsFilters } from "../types";
import { CreateTagDto, tagService, UpdateTagDto } from "../api/tags.service";
import { useAppSelector } from "@/core/store/hooks";

// ─── useTags ───────────────────────────────────────────────

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Tag, Error, CreateTagDto>({
    mutationFn: (data) => tagService.createTag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tags", currentOrganizationId],
      });
    },
  });
}

export function useGetTags(params: TagsFilters) {
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  return useQuery<Tags, Error>({
    queryKey: ["tags", currentOrganizationId, params],
    enabled: !!currentOrganizationId,
    queryFn: async () => {
      const response = await tagService.getTags(params);
      return response;
    },
  });
}

export function useGetTagById(id: string) {
  return useQuery<Tag, Error>({
    queryKey: ["tag", id],
    queryFn: async () => {
      const response = await tagService.getTagById(id);
      return response;
    },
  });
}

export function useUpdateTag(id: string) {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Tag, Error, UpdateTagDto>({
    mutationFn: (data) => tagService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tag", id] });
      queryClient.invalidateQueries({
        queryKey: ["tags", currentOrganizationId],
      });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<{ message: string }, Error, string>({
    mutationFn: (id: string) => tagService.deleteTag(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["tag", id] });
      queryClient.invalidateQueries({
        queryKey: ["tags", currentOrganizationId],
      });
    },
  });
}

export function useRestoreTag() {
  const queryClient = useQueryClient();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );

  return useMutation<Tag, Error, string>({
    mutationFn: (id: string) => tagService.restoreTag(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ["tag", id] });
      queryClient.invalidateQueries({ queryKey: ["tags", currentOrganizationId] });
    },
  });
}
