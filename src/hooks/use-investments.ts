import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentService } from "@/services/investment.service";
import { CreateInvestmentPayload, UpdateInvestmentPayload } from "@/types/investment.types";
import { toast } from "sonner";
import { PaginatedResponse } from "@/types/pagination.types";

export const INVESTMENT_QUERY_KEY = ["investments"];

export function useInvestments(params?: { page?: number; pageSize?: number; q?: string }) {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const q = params?.q ?? "";
    return useQuery({
        queryKey: [...INVESTMENT_QUERY_KEY, { page, pageSize, q }],
        queryFn: () => investmentService.findPaged({ page, pageSize, q }),
        placeholderData: (prev) => prev as PaginatedResponse<any> | undefined,
    });
}

export function useInvestment(id: string) {
    return useQuery({
        queryKey: [...INVESTMENT_QUERY_KEY, id],
        queryFn: () => investmentService.findOne(id),
        enabled: !!id,
    });
}

export function useCreateInvestment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateInvestmentPayload) => investmentService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVESTMENT_QUERY_KEY });
            toast.success("Investissement (saisie) créé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la création de l'investissement");
        },
    });
}

export function useUpdateInvestment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateInvestmentPayload }) =>
            investmentService.update(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: INVESTMENT_QUERY_KEY });
            queryClient.setQueryData([...INVESTMENT_QUERY_KEY, data.id], data);
            toast.success("Investissement mis à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la mise à jour");
        },
    });
}

export function useDeleteInvestment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => investmentService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: INVESTMENT_QUERY_KEY });
            toast.success("Donnée supprimée avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
