import { Project } from "./project.types";

export type Priority = "HAUTE" | "MOYENNE" | "BASSE";

/** Codes stockés côté API */
export type InvestmentStatut = "EN_COURS" | "NON_PROGRAMME" | "TERMINE";

export interface InvestmentGain {
    id: string;
    investmentId: string;
    mois: string;
    montant: number;
    createdAt: string;
}

export interface Investment {
    id: string;
    projectId: string;
    project?: Project;
    annee: number;
    priorite: Priority;
    budgetPrevisionnel: number;
    coutReel: number | null;
    gainMensuel: boolean;
    montantGenere: number | null;
    statut: InvestmentStatut | string;
    gainTypeId: string | null;
    gainType?: { id: string; name: string } | null;
    methodeEstimation: string | null;
    kpiCles: string | null;
    commentaires: string | null;
    gains?: InvestmentGain[];

    createdAt: string;
    updatedAt: string;
    createdById: string;
    createdBy?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
}

export interface GainPayload {
    mois: string;
    montant: number;
}

export interface CreateInvestmentPayload {
    projectId: string;
    annee: number;
    priorite?: Priority;
    budgetPrevisionnel: number;
    coutReel?: number;
    gainMensuel?: boolean;
    montantGenere?: number;
    statut?: InvestmentStatut | string;
    gainTypeId?: string | null;
    methodeEstimation?: string;
    kpiCles?: string;
    commentaires?: string;
    gains?: GainPayload[];
}

export interface UpdateInvestmentPayload extends Partial<CreateInvestmentPayload> { }
