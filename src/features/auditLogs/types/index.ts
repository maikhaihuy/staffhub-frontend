export type AuditLogEntry = {
  id: number;
  actorId: number;
  action: string;
  subject: string;
  entityId: number;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
};

export type AuditLogFilter = {
  subject?: string;
  actorId?: number;
  entityId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
};
