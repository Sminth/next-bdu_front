export interface AxeStrategique {
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

export interface CreateAxeStrategiquePayload {
  name: string;
  description?: string;
}

export interface UpdateAxeStrategiquePayload {
  name?: string;
  description?: string;
}
