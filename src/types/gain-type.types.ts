export interface GainType {
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

export interface CreateGainTypePayload {
  name: string;
  description?: string;
}

export interface UpdateGainTypePayload {
  name?: string;
  description?: string;
}
