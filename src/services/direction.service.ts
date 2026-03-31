import { request } from "@/lib/request";
import { Direction, CreateDirectionPayload, UpdateDirectionPayload } from "@/types/direction.types";
import { PaginatedResponse } from "@/types/pagination.types";

const DIRECTION_ENDPOINT = "/direction";

export const directionService = {
    findAll: async (): Promise<Direction[]> => {
        return request.get<Direction[]>(DIRECTION_ENDPOINT);
    },

    findPaged: async (params: { page: number; pageSize: number; q?: string }): Promise<PaginatedResponse<Direction>> => {
        return request.get<PaginatedResponse<Direction>>(`${DIRECTION_ENDPOINT}/paged`, { params });
    },

    exportAll: async (q?: string): Promise<Record<string, any>[]> => {
        return request.get<Record<string, any>[]>(`${DIRECTION_ENDPOINT}/export`, { params: { q } });
    },

    findOne: async (id: string): Promise<Direction> => {
        return request.get<Direction>(`${DIRECTION_ENDPOINT}/${id}`);
    },

    create: async (payload: CreateDirectionPayload): Promise<Direction> => {
        return request.post<Direction>(DIRECTION_ENDPOINT, payload);
    },

    update: async (id: string, payload: UpdateDirectionPayload): Promise<Direction> => {
        return request.put<Direction>(`${DIRECTION_ENDPOINT}/${id}`, payload);
    },

    remove: async (id: string): Promise<void> => {
        return request.delete<void>(`${DIRECTION_ENDPOINT}/${id}`);
    },
};
