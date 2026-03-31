import { request } from "@/lib/request";
import { UserSessionResponse } from "@/types/user-session.types";

export const userSessionService = {
  findAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request.get<UserSessionResponse>(`/user-session${qs ? `?${qs}` : ""}`);
  },

  exportAll: (search?: string): Promise<Record<string, any>[]> => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    const qs = query.toString();
    return request.get<Record<string, any>[]>(`/user-session/export${qs ? `?${qs}` : ""}`);
  },
};
