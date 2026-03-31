import { request } from "@/lib/request";

export interface DashboardStats {
    summary: {
        totalInvestments: number;
        totalProjects: number;
        totalDomains: number;
        validated: number;
        enCours: number;
        brouillons: number;
        rejetes: number;
        budgetTotal: number;
        budgetCurrentYear: number;
        coutReelTotal: number;
        montantGenereTotal: number;
        roiMoyen: number;
        currentYear: number;
    };
    investmentsByStatus: { statut: string; count: number }[];
    investmentsByYear: {
        annee: number;
        budget: number;
        coutReel: number;
        count: number;
    }[];
    topDomains: {
        domainId: string;
        name: string;
        budget: number;
        count: number;
    }[];
    recentInvestments: any[];
}

export const statsService = {
    getDashboardStats: (): Promise<DashboardStats> => request.get<DashboardStats>("/stats/dashboard"),
};

