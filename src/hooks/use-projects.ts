import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/services/project.service";
import { CreateProjectPayload, UpdateProjectPayload, Project, CreatePaymentPayload } from "@/types/project.types";
import { toast } from "@/lib/toast";
import { PaginatedResponse } from "@/types/pagination.types";

export const PROJECT_QUERY_KEY = ["projects"];

export function useProjects() {
    return useQuery({
        queryKey: PROJECT_QUERY_KEY,
        queryFn: () => projectService.findAll(),
    });
}

export function useProjectsPaged(params: { page: number; pageSize: number; q?: string }) {
    const page = params.page;
    const pageSize = params.pageSize;
    const q = params.q ?? "";
    return useQuery({
        queryKey: [...PROJECT_QUERY_KEY, "paged", { page, pageSize, q }],
        queryFn: () => projectService.findPaged({ page, pageSize, q }),
        placeholderData: (prev) => prev as PaginatedResponse<Project> | undefined,
    });
}

export function useProject(id: string) {
    return useQuery({
        queryKey: [...PROJECT_QUERY_KEY, id],
        queryFn: () => projectService.findOne(id),
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateProjectPayload) => projectService.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
            toast.success("Projet créé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la création du projet");
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
            projectService.update(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
            queryClient.setQueryData([...PROJECT_QUERY_KEY, data.id], data);
            toast.success("Projet mis à jour avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la mise à jour du projet");
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
            toast.success("Projet supprimé avec succès");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la suppression du projet");
        },
    });
}

export const PAYMENTS_QUERY_KEY = (projectId: string) => ["project-payments", projectId];

export function useProjectPayments(projectId: string | null) {
    return useQuery({
        queryKey: PAYMENTS_QUERY_KEY(projectId ?? ""),
        queryFn: () => projectService.getPayments(projectId!),
        enabled: !!projectId,
    });
}

export function useCreatePayments(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payments: CreatePaymentPayload[]) =>
            projectService.createPayments(projectId, payments),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY(projectId) });
            toast.success("Paiement(s) enregistré(s)");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de l'enregistrement");
        },
    });
}

export function useDeletePayment(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (paymentId: string) =>
            projectService.deletePayment(projectId, paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY(projectId) });
            toast.success("Tranche supprimée");
        },
        onError: (error: any) => {
            toast.error(error.message || "Erreur lors de la suppression");
        },
    });
}
