import { request } from "@/lib/request";
import {
  GainType,
  CreateGainTypePayload,
  UpdateGainTypePayload,
} from "@/types/gain-type.types";
import { PaginatedResponse } from "@/types/pagination.types";

const ENDPOINT = "/gain-type";

export const gainTypeService = {
  findAll: async (): Promise<GainType[]> => {
    return request.get<GainType[]>(ENDPOINT);
  },

  findPaged: async (params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<PaginatedResponse<GainType>> => {
    return request.get<PaginatedResponse<GainType>>(`${ENDPOINT}/paged`, {
      params,
    });
  },

  exportAll: async (q?: string): Promise<Record<string, any>[]> => {
    return request.get<Record<string, any>[]>(`${ENDPOINT}/export`, { params: { q } });
  },

  findOne: async (id: string): Promise<GainType> => {
    return request.get<GainType>(`${ENDPOINT}/${id}`);
  },

  create: async (payload: CreateGainTypePayload): Promise<GainType> => {
    return request.post<GainType>(ENDPOINT, payload);
  },

  update: async (id: string, payload: UpdateGainTypePayload): Promise<GainType> => {
    return request.put<GainType>(`${ENDPOINT}/${id}`, payload);
  },

  remove: async (id: string): Promise<void> => {
    return request.delete<void>(`${ENDPOINT}/${id}`);
  },
};
