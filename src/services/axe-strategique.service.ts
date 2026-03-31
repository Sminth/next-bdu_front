import { request } from "@/lib/request";
import {
  AxeStrategique,
  CreateAxeStrategiquePayload,
  UpdateAxeStrategiquePayload,
} from "@/types/axe-strategique.types";
import { PaginatedResponse } from "@/types/pagination.types";

const AXE_STRATEGIQUE_ENDPOINT = "/axe-strategique";

export const axeStrategiqueService = {
  findAll: async (): Promise<AxeStrategique[]> => {
    return request.get<AxeStrategique[]>(AXE_STRATEGIQUE_ENDPOINT);
  },

  findPaged: async (params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<PaginatedResponse<AxeStrategique>> => {
    return request.get<PaginatedResponse<AxeStrategique>>(
      `${AXE_STRATEGIQUE_ENDPOINT}/paged`,
      { params },
    );
  },

  exportAll: async (q?: string): Promise<Record<string, any>[]> => {
    return request.get<Record<string, any>[]>(`${AXE_STRATEGIQUE_ENDPOINT}/export`, { params: { q } });
  },

  findOne: async (id: string): Promise<AxeStrategique> => {
    return request.get<AxeStrategique>(`${AXE_STRATEGIQUE_ENDPOINT}/${id}`);
  },

  create: async (
    payload: CreateAxeStrategiquePayload
  ): Promise<AxeStrategique> => {
    return request.post<AxeStrategique>(AXE_STRATEGIQUE_ENDPOINT, payload);
  },

  update: async (
    id: string,
    payload: UpdateAxeStrategiquePayload
  ): Promise<AxeStrategique> => {
    return request.put<AxeStrategique>(
      `${AXE_STRATEGIQUE_ENDPOINT}/${id}`,
      payload
    );
  },

  remove: async (id: string): Promise<void> => {
    return request.delete<void>(`${AXE_STRATEGIQUE_ENDPOINT}/${id}`);
  },
};
