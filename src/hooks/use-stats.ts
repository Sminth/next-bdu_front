import { useQuery } from "@tanstack/react-query";
import { statsService, DashboardStats } from "@/services/stats.service";

export const useDashboardStats = () => {
    return useQuery<DashboardStats>({
        queryKey: ["stats", "dashboard"],
        queryFn: () => statsService.getDashboardStats(),
        staleTime: 1000 * 30, // 30 seconds
    });
};
