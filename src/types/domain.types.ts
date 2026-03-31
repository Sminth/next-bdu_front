export interface Domain {
    id: string;
    name: string;
    description: string | null;
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

export interface CreateDomainPayload {
    name: string;
    description?: string;
}

export interface UpdateDomainPayload {
    name?: string;
    description?: string;
}
