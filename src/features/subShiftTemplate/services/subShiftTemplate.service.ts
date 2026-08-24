import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  SubShiftTemplate,
  CreateSubShiftTemplateDTO,
  UpdateSubShiftTemplateDTO,
} from "../types";

const base = createCrudService<
  SubShiftTemplate,
  CreateSubShiftTemplateDTO,
  UpdateSubShiftTemplateDTO
>(API_ENDPOINTS.SUB_SHIFT_TEMPLATES.BASE);

export const subShiftTemplateService = {
  ...base,
  // Backend requires both branchId and masterShiftTemplateId on findAll.
  listByMasterShiftTemplate: (branchId: number, masterShiftTemplateId: number) =>
    base.list({ branchId, masterShiftTemplateId }),
};
