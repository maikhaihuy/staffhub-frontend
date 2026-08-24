import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { taskTemplateService } from "../services/taskTemplate.service";
import { TaskTemplate } from "../types";

export const useGetTaskTemplatesByBranch = (branchId: number) =>
  useAppQuery<TaskTemplate[]>(
    queryKeys.taskTemplates.byBranch(branchId),
    () => taskTemplateService.listByBranch(branchId),
    { enabled: !!branchId }
  );

export const useGetTaskTemplatesBySubShiftTemplate = (
  branchId: number,
  subShiftTemplateId: number
) =>
  useAppQuery<TaskTemplate[]>(
    queryKeys.taskTemplates.byBranch(branchId),
    () => taskTemplateService.listByBranch(branchId),
    {
      enabled: !!branchId && !!subShiftTemplateId,
      select: (taskTemplates) =>
        taskTemplates.filter((t) => t.subShiftTemplateId === subShiftTemplateId),
    }
  );
