import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gainTypeService } from "@/services/gain-type.service";
import {
  CreateGainTypePayload,
  UpdateGainTypePayload,
  GainType,
} from "@/types/gain-type.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";

export const GAIN_TYPE_QUERY_KEY = ["gain-types"];

export function useGainTypes() {
  return useQuery({
    queryKey: GAIN_TYPE_QUERY_KEY,
    queryFn: () => gainTypeService.findAll(),
  });
}

export function useGainTypesPaged(params: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const page = params.page;
  const pageSize = params.pageSize;
  const q = params.q ?? "";
  return useQuery({
    queryKey: [...GAIN_TYPE_QUERY_KEY, "paged", { page, pageSize, q }],
    queryFn: () => gainTypeService.findPaged({ page, pageSize, q }),
    placeholderData: (prev) => prev as PaginatedResponse<GainType> | undefined,
  });
}

export function useCreateGainType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGainTypePayload) =>
      gainTypeService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAIN_TYPE_QUERY_KEY });
      toast.success("Type de gain créé");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur à la création");
    },
  });
}

export function useUpdateGainType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateGainTypePayload;
    }) => gainTypeService.update(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: GAIN_TYPE_QUERY_KEY });
      queryClient.setQueryData([...GAIN_TYPE_QUERY_KEY, data.id], data);
      toast.success("Type de gain mis à jour");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur à la mise à jour");
    },
  });
}

export function useDeleteGainType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gainTypeService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GAIN_TYPE_QUERY_KEY });
      toast.success("Type de gain supprimé");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur à la suppression");
    },
  });
}
