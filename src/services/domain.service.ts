import { request } from "@/lib/request";
import { Domain, CreateDomainPayload, UpdateDomainPayload } from "@/types/domain.types";
import { PaginatedResponse } from "@/types/pagination.types";

const DOMAIN_ENDPOINT = "/domain";

export const domainService = {
    findAll: async (): Promise<Domain[]> => {
        return request.get<Domain[]>(DOMAIN_ENDPOINT);
    },

    findPaged: async (params: { page: number; pageSize: number; q?: string }): Promise<PaginatedResponse<Domain>> => {
        return request.get<PaginatedResponse<Domain>>(`${DOMAIN_ENDPOINT}/paged`, { params });
    },

    exportAll: async (q?: string): Promise<Record<string, any>[]> => {
        return request.get<Record<string, any>[]>(`${DOMAIN_ENDPOINT}/export`, { params: { q } });
    },

    findOne: async (id: string): Promise<Domain> => {
        return request.get<Domain>(`${DOMAIN_ENDPOINT}/${id}`);
    },

    create: async (payload: CreateDomainPayload): Promise<Domain> => {
        return request.post<Domain>(DOMAIN_ENDPOINT, payload);
    },

    update: async (id: string, payload: UpdateDomainPayload): Promise<Domain> => {
        return request.put<Domain>(`${DOMAIN_ENDPOINT}/${id}`, payload);
    },

    remove: async (id: string): Promise<void> => {
        return request.delete<void>(`${DOMAIN_ENDPOINT}/${id}`);
    },
};
