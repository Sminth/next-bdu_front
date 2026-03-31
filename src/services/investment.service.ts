import { request } from "@/lib/request";
import { Investment, CreateInvestmentPayload, UpdateInvestmentPayload } from "@/types/investment.types";
import { PaginatedResponse } from "@/types/pagination.types";

const INVESTMENT_ENDPOINT = "/investment";

export const investmentService = {
    findAll: async (): Promise<Investment[]> => {
        return request.get<Investment[]>(INVESTMENT_ENDPOINT);
    },

    findPaged: async (params: { page: number; pageSize: number; q?: string }): Promise<PaginatedResponse<Investment>> => {
        const res = await request.get<any>(INVESTMENT_ENDPOINT, { params });

        // Compat: si l'API renvoie encore une liste brute (ancienne version),
        // on normalise côté front pour éviter un tableau vide.
        if (Array.isArray(res)) {
            const start = (params.page - 1) * params.pageSize;
            const end = start + params.pageSize;
            return {
                items: (res as Investment[]).slice(start, end),
                total: (res as Investment[]).length,
                page: params.page,
                pageSize: params.pageSize,
            };
        }

        return res as PaginatedResponse<Investment>;
    },

    findOne: async (id: string): Promise<Investment> => {
        return request.get<Investment>(`${INVESTMENT_ENDPOINT}/${id}`);
    },

    create: async (payload: CreateInvestmentPayload): Promise<Investment> => {
        return request.post<Investment>(INVESTMENT_ENDPOINT, payload);
    },

    update: async (id: string, payload: UpdateInvestmentPayload): Promise<Investment> => {
        return request.put<Investment>(`${INVESTMENT_ENDPOINT}/${id}`, payload);
    },

    remove: async (id: string): Promise<void> => {
        return request.delete<void>(`${INVESTMENT_ENDPOINT}/${id}`);
    },

    exportAll: async (): Promise<Record<string, any>[]> => {
        return request.get<Record<string, any>[]>(`${INVESTMENT_ENDPOINT}/export`);
    },
};
