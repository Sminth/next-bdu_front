import { useQuery } from "@tanstack/react-query";
import { userSessionService } from "@/services/user-session.service";

export function useUserSessions(params?: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["user-sessions", params],
    queryFn: () => userSessionService.findAll(params),
    placeholderData: (prev) => prev,
  });
}
