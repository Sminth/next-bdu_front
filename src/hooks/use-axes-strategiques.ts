import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axeStrategiqueService } from "@/services/axe-strategique.service";
import {
  CreateAxeStrategiquePayload,
  UpdateAxeStrategiquePayload,
  AxeStrategique,
} from "@/types/axe-strategique.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";

export const AXE_STRATEGIQUE_QUERY_KEY = ["axes-strategiques"];

export function useAxesStrategiques() {
  return useQuery({
    queryKey: AXE_STRATEGIQUE_QUERY_KEY,
    queryFn: () => axeStrategiqueService.findAll(),
  });
}

export function useAxesStrategiquesPaged(params: {
  page: number;
  pageSize: number;
  q?: string;
}) {
  const page = params.page;
  const pageSize = params.pageSize;
  const q = params.q ?? "";
  return useQuery({
    queryKey: [...AXE_STRATEGIQUE_QUERY_KEY, "paged", { page, pageSize, q }],
    queryFn: () => axeStrategiqueService.findPaged({ page, pageSize, q }),
    placeholderData: (prev) => prev as PaginatedResponse<AxeStrategique> | undefined,
  });
}

export function useAxeStrategique(id: string) {
  return useQuery({
    queryKey: [...AXE_STRATEGIQUE_QUERY_KEY, id],
    queryFn: () => axeStrategiqueService.findOne(id),
    enabled: !!id,
  });
}

export function useCreateAxeStrategique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAxeStrategiquePayload) =>
      axeStrategiqueService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AXE_STRATEGIQUE_QUERY_KEY });
      toast.success("Axe stratégique créé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la création de l'axe stratégique"
      );
    },
  });
}

export function useUpdateAxeStrategique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAxeStrategiquePayload;
    }) => axeStrategiqueService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AXE_STRATEGIQUE_QUERY_KEY });
      toast.success("Axe stratégique mis à jour avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la mise à jour de l'axe stratégique"
      );
    },
  });
}

export function useDeleteAxeStrategique() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axeStrategiqueService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AXE_STRATEGIQUE_QUERY_KEY });
      toast.success("Axe stratégique supprimé avec succès");
    },
    onError: (error: unknown) => {
      toast.error(
        (error as { message?: string })?.message ||
          "Erreur lors de la suppression de l'axe stratégique"
      );
    },
  });
}
