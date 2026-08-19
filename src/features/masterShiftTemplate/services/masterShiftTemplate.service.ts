import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  MasterShiftTemplate,
  CreateMasterShiftTemplateDTO,
  UpdateMasterShiftTemplateDTO,
} from "../types";

const base = createCrudService<
  MasterShiftTemplate,
  CreateMasterShiftTemplateDTO,
  UpdateMasterShiftTemplateDTO
>(API_ENDPOINTS.MASTER_SHIFT_TEMPLATES.BASE);

export const masterShiftTemplateService = {
  ...base,
  listByBranch: (branchId: number) => base.list({ branchId }),
};
