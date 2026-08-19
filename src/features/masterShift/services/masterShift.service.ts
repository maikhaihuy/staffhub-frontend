import axios from "@/lib/api/axios";
import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { MasterShift, CreateMasterShiftDTO, UpdateMasterShiftDTO } from "../types";

const base = createCrudService<MasterShift, CreateMasterShiftDTO, UpdateMasterShiftDTO>(
  API_ENDPOINTS.MASTER_SHIFTS.BASE
);

export const masterShiftService = {
  ...base,
  listByBranch: (branchId: number, from?: string, to?: string) =>
    base.list({ branchId, from, to }),

  /** Generates a MasterShift (+ its SubShifts/Tasks) from a template for one date. */
  generate: async (masterShiftTemplateId: number, workDate: string): Promise<MasterShift> => {
    const res = await axios.post<MasterShift>(API_ENDPOINTS.MASTER_SHIFTS.GENERATE, {
      masterShiftTemplateId,
      workDate,
    });
    return res.data;
  },
};
