import { request } from "@/lib/request";
import {
  UserAdmin,
  CreateUserByAdminPayload,
  UpdateUserByAdminPayload,
} from "@/types/user-admin.types";
import { PaginatedResponse } from "@/types/pagination.types";

const USERS_ENDPOINT = "/users";

export const userAdminService = {
  findAll: async (): Promise<UserAdmin[]> => {
    return request.get<UserAdmin[]>(USERS_ENDPOINT);
  },

  findPaged: async (params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<PaginatedResponse<UserAdmin>> => {
    return request.get<PaginatedResponse<UserAdmin>>(`${USERS_ENDPOINT}/paged`, {
      params,
    });
  },

  findOne: async (id: string): Promise<UserAdmin> => {
    return request.get<UserAdmin>(`${USERS_ENDPOINT}/${id}`);
  },

  create: async (payload: CreateUserByAdminPayload): Promise<UserAdmin> => {
    return request.post<UserAdmin>(USERS_ENDPOINT, payload);
  },

  update: async (
    id: string,
    payload: UpdateUserByAdminPayload
  ): Promise<UserAdmin> => {
    return request.put<UserAdmin>(`${USERS_ENDPOINT}/${id}`, payload);
  },

  remove: async (id: string): Promise<void> => {
    return request.delete<void>(`${USERS_ENDPOINT}/${id}`);
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ message: string }> => {
    return request.post<{ message: string }>(`${USERS_ENDPOINT}/${id}/reset-password`, { newPassword });
  },

  exportAll: async (): Promise<Record<string, any>[]> => {
    return request.get<Record<string, any>[]>(`${USERS_ENDPOINT}/export`);
  },
};
