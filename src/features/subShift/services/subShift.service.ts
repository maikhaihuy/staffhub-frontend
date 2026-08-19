import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { SubShift, CreateSubShiftDTO, UpdateSubShiftDTO } from "../types";

const base = createCrudService<SubShift, CreateSubShiftDTO, UpdateSubShiftDTO>(
  API_ENDPOINTS.SUB_SHIFTS.BASE
);

export const subShiftService = {
  ...base,
  listByMasterShift: (masterShiftId: number) => base.list({ masterShiftId }),
};
