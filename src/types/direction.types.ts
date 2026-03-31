export interface Direction {
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

export interface CreateDirectionPayload {
    name: string;
    description?: string;
}

export interface UpdateDirectionPayload {
    name?: string;
    description?: string;
}
