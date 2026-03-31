export type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any> | null;
  userId?: string | null;
  userEmail?: string | null;
  createdAt: string;
};

export type AuditLogResponse = {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
