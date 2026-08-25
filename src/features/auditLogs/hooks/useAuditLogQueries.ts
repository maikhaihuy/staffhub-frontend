import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { queryKeys } from "@/lib/queryKeys";
import { auditLogService } from "../services/auditLog.service";
import { AuditLogEntry, AuditLogFilter } from "../types";

export const useGetAuditLogs = (filter: AuditLogFilter) =>
  useAppQuery<AuditLogEntry[]>(
    queryKeys.auditLogs.list(filter as Record<string, string | number | undefined>),
    () => auditLogService.list(filter)
  );
