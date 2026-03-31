import { request } from "@/lib/request";
import {
  Profile,
  CreateProfilePayload,
  UpdateProfilePayload,
} from "@/types/profile.types";
import { PaginatedResponse } from "@/types/pagination.types";

const PROFILE_ENDPOINT = "/profile";

export const profileService = {
  findAll: async (): Promise<Profile[]> => {
    return request.get<Profile[]>(PROFILE_ENDPOINT);
  },

  findPaged: async (params: {
    page: number;
    pageSize: number;
    q?: string;
  }): Promise<PaginatedResponse<Profile>> => {
    return request.get<PaginatedResponse<Profile>>(`${PROFILE_ENDPOINT}/paged`, {
      params,
    });
  },

  exportAll: async (q?: string): Promise<Record<string, any>[]> => {
    return request.get<Record<string, any>[]>(`${PROFILE_ENDPOINT}/export`, { params: { q } });
  },

  findOne: async (id: string): Promise<Profile> => {
    return request.get<Profile>(`${PROFILE_ENDPOINT}/${id}`);
  },

  create: async (payload: CreateProfilePayload): Promise<Profile> => {
    return request.post<Profile>(PROFILE_ENDPOINT, payload);
  },

  update: async (
    id: string,
    payload: UpdateProfilePayload
  ): Promise<Profile> => {
    return request.put<Profile>(`${PROFILE_ENDPOINT}/${id}`, payload);
  },

  setPermissions: async (
    id: string,
    permissionIds: string[]
  ): Promise<Profile> => {
    return request.put<Profile>(`${PROFILE_ENDPOINT}/${id}/permissions`, {
      permissionIds,
    });
  },

  remove: async (id: string): Promise<void> => {
    return request.delete<void>(`${PROFILE_ENDPOINT}/${id}`);
  },
};
