import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { domainService } from "@/services/domain.service";
import { CreateDomainPayload, UpdateDomainPayload } from "@/types/domain.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";
import { Domain } from "@/types/domain.types";

export const DOMAIN_QUERY_KEY = ["domains"];

export function useDomains() {
    return useQuery({
        queryKey: DOMAIN_QUERY_KEY,
        queryFn: () => domainService.findAll(),
    });
}

export function useDomainsPaged(params: { page: number; pageSize: number; q?: string }) {
    const page = params.page;
    const pageSize = params.pageSize;
    const q = params.q ?? "";
    return useQuery({
        queryKey: [...DOMAIN_QUERY_KEY, "paged", { page, pageSize, q }],
        queryFn: () => domainService.findPaged({ page, pageSize, q }),
        placeholderData: (prev) => prev as PaginatedResponse<Domain> | undefined,
    });
}

export function useDomain(id: string) {
    return useQuery({
        queryKey: [...DOMAIN_QUERY_KEY, id],
        queryFn: () => domainService.findOne(id),
        enabled: !!id,
    });
}

export function useCreateDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateDomainPayload) => domainService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOMAIN_QUERY_KEY });
            toast.success("Domaine créé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la création du domaine");
        },
    });
}

export function useUpdateDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateDomainPayload }) =>
            domainService.update(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: DOMAIN_QUERY_KEY });
            queryClient.setQueryData([...DOMAIN_QUERY_KEY, data.id], data);
            toast.success("Domaine mis à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la mise à jour du domaine");
        },
    });
}

export function useDeleteDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => domainService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DOMAIN_QUERY_KEY });
            toast.success("Domaine supprimé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la suppression du domaine");
        },
    });
}
