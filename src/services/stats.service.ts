import { request } from "@/lib/request";

export interface DashboardStats {
    filters: {
        annee: number | null;
        mois: number | null;
    };
    summary: {
        totalInvestments: number;
        totalProjects: number;
        totalDomains: number;
        validated: number;
        enCours: number;
        brouillons: number;
        rejetes: number;
        termines?: number;
        nonProgrammes?: number;
        budgetTotal: number;
        budgetPrevisionnelTotal: number;
        budgetReelTotal: number;
        budgetDepenseTotal: number;
        budgetCurrentYear: number;
        coutReelTotal: number;
        montantGenereTotal: number;
        roiMoyen: number;
        currentYear: number;
        availableYears: number[];
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

export type DashboardStatsParams = {
    annee?: number;
    mois?: number;
};

export const statsService = {
    getDashboardStats: (params?: DashboardStatsParams): Promise<DashboardStats> => {
        const search = new URLSearchParams();
        if (params?.annee != null) search.set("annee", String(params.annee));
        if (params?.mois != null) search.set("mois", String(params.mois));
        const q = search.toString();
        return request.get<DashboardStats>(`/stats/dashboard${q ? `?${q}` : ""}`);
    },
};
