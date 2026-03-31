export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string;
  createdAt?: string;
}
