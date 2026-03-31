import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/audit.service";

export function useAuditLogs(params?: { page?: number; limit?: number; entity?: string; q?: string }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => auditService.findAll(params),
    placeholderData: (prev) => prev,
  });
}
