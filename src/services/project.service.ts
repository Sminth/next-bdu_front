import { request } from "@/lib/request";
import { Project, CreateProjectPayload, UpdateProjectPayload, ProjectPayment, CreatePaymentPayload } from "@/types/project.types";
import { PaginatedResponse } from "@/types/pagination.types";

const PROJECT_ENDPOINT = "/project";

export const projectService = {
    findAll: async (): Promise<Project[]> => {
        return request.get<Project[]>(PROJECT_ENDPOINT);
    },

    findPaged: async (params: { page: number; pageSize: number; q?: string }): Promise<PaginatedResponse<Project>> => {
        return request.get<PaginatedResponse<Project>>(`${PROJECT_ENDPOINT}/paged`, { params });
    },

    findOne: async (id: string): Promise<Project> => {
        return request.get<Project>(`${PROJECT_ENDPOINT}/${id}`);
    },

    create: async (payload: CreateProjectPayload): Promise<Project> => {
        return request.post<Project>(PROJECT_ENDPOINT, payload);
    },

    update: async (id: string, payload: UpdateProjectPayload): Promise<Project> => {
        return request.put<Project>(`${PROJECT_ENDPOINT}/${id}`, payload);
    },

    remove: async (id: string): Promise<void> => {
        return request.delete<void>(`${PROJECT_ENDPOINT}/${id}`);
    },

    exportAll: async (): Promise<Record<string, any>[]> => {
        return request.get<Record<string, any>[]>(`${PROJECT_ENDPOINT}/export`);
    },

    getPayments: async (projectId: string): Promise<ProjectPayment[]> => {
        return request.get<ProjectPayment[]>(`${PROJECT_ENDPOINT}/${projectId}/payments`);
    },

    createPayments: async (projectId: string, payments: CreatePaymentPayload[]): Promise<{ count: number }> => {
        return request.post<{ count: number }>(`${PROJECT_ENDPOINT}/${projectId}/payments`, { payments });
    },

    deletePayment: async (projectId: string, paymentId: string): Promise<void> => {
        return request.delete<void>(`${PROJECT_ENDPOINT}/${projectId}/payments/${paymentId}`);
    },
};
