import axios from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { AuditLogEntry, AuditLogFilter } from "../types";

export const auditLogService = {
  list: async (filter: AuditLogFilter = {}): Promise<AuditLogEntry[]> => {
    const res = await axios.get<AuditLogEntry[]>(API_ENDPOINTS.AUDIT_LOGS.BASE, {
      params: filter,
    });
    return res.data;
  },
};
