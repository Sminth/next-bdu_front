import { request } from "@/lib/request";
import { AuditLogResponse } from "@/types/audit.types";

export const auditService = {
  findAll: (params?: { page?: number; limit?: number; entity?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.entity) query.set("entity", params.entity);
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return request.get<AuditLogResponse>(`/audit${qs ? `?${qs}` : ""}`);
  },

  exportAll: (params?: { entity?: string; q?: string }): Promise<Record<string, any>[]> => {
    const query = new URLSearchParams();
    if (params?.entity) query.set("entity", params.entity);
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return request.get<Record<string, any>[]>(`/audit/export${qs ? `?${qs}` : ""}`);
  },
};
