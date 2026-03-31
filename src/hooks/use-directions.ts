import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { directionService } from "@/services/direction.service";
import { CreateDirectionPayload, UpdateDirectionPayload, Direction } from "@/types/direction.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";

export const DIRECTION_QUERY_KEY = ["directions"];

export function useDirections() {
    return useQuery({
        queryKey: DIRECTION_QUERY_KEY,
        queryFn: () => directionService.findAll(),
    });
}

export function useDirectionsPaged(params: { page: number; pageSize: number; q?: string }) {
    const page = params.page;
    const pageSize = params.pageSize;
    const q = params.q ?? "";
    return useQuery({
        queryKey: [...DIRECTION_QUERY_KEY, "paged", { page, pageSize, q }],
        queryFn: () => directionService.findPaged({ page, pageSize, q }),
        placeholderData: (prev) => prev as PaginatedResponse<Direction> | undefined,
    });
}

export function useDirection(id: string) {
    return useQuery({
        queryKey: [...DIRECTION_QUERY_KEY, id],
        queryFn: () => directionService.findOne(id),
        enabled: !!id,
    });
}

export function useCreateDirection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDirectionPayload) => directionService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIRECTION_QUERY_KEY });
            toast.success("Direction créée avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la création de la direction");
        },
    });
}

export function useUpdateDirection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateDirectionPayload }) =>
            directionService.update(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: DIRECTION_QUERY_KEY });
            queryClient.setQueryData([...DIRECTION_QUERY_KEY, data.id], data);
            toast.success("Direction mise à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la mise à jour de la direction");
        },
    });
}

export function useDeleteDirection() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => directionService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DIRECTION_QUERY_KEY });
            toast.success("Direction supprimée avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la suppression de la direction");
        },
    });
}
