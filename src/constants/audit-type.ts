/**
 * Audit fields pour le tracking des créations et modifs sur les entities
 */
export type AuditFields = {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  createdBy: string | null;
  deletedBy: string | null;
  updatedBy: string | null;
};
