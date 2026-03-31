import { AdminUser } from './auth.types';

export interface ProjectPayment {
    id: string;
    projectId: string;
    date: string;
    montant: number;
    note?: string | null;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string | null;
    projectManager?: string | null;
    domainId?: string | null;
    domain?: { id: string; name: string } | null;
    axeStrategiqueId?: string | null;
    axeStrategique?: { id: string; name: string } | null;
    startDate?: string | null;
    expectedEndDate?: string | null;
    actualEndDate?: string | null;
    completionPercentage?: number | null;
    prestataire?: string | null;
    prestataireContact?: string | null;
    prestataireEmail?: string | null;
    montantContrat?: number | null;
    payments?: ProjectPayment[];
    createdAt: string;
    updatedAt: string;
    createdById: string;
    createdBy?: Partial<AdminUser>;
}

export interface CreateProjectPayload {
    name: string;
    description?: string;
    projectManager?: string;
    domainId?: string;
    axeStrategiqueId?: string;
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    completionPercentage?: number;
    prestataire?: string;
    prestataireContact?: string;
    prestataireEmail?: string;
    montantContrat?: number;
}

export interface UpdateProjectPayload {
    name?: string;
    description?: string;
    projectManager?: string;
    domainId?: string;
    axeStrategiqueId?: string;
    startDate?: string;
    expectedEndDate?: string;
    actualEndDate?: string;
    completionPercentage?: number;
    prestataire?: string;
    prestataireContact?: string;
    prestataireEmail?: string;
    montantContrat?: number;
}

export interface CreatePaymentPayload {
    date: string;
    montant: number;
    note?: string;
}
