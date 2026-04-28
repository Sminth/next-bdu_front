import { useQuery } from "@tanstack/react-query";
import { statsService, DashboardStats, DashboardStatsParams } from "@/services/stats.service";

export const useDashboardStats = (params?: DashboardStatsParams) => {
    return useQuery<DashboardStats>({
        queryKey: ["stats", "dashboard", params?.annee ?? null, params?.mois ?? null],
        queryFn: () => statsService.getDashboardStats(params),
        staleTime: 1000 * 30, // 30 seconds
    });
};
