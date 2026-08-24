import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { TaskTemplate, CreateTaskTemplateDTO, UpdateTaskTemplateDTO } from "../types";

const base = createCrudService<TaskTemplate, CreateTaskTemplateDTO, UpdateTaskTemplateDTO>(
  API_ENDPOINTS.TASK_TEMPLATES.BASE
);

export const taskTemplateService = {
  ...base,
  // Backend only filters findAll by branchId; scoping to a master shift
  // template happens client-side (see useGetTaskTemplatesByMasterShiftTemplate).
  listByBranch: (branchId: number) => base.list({ branchId }),
};
