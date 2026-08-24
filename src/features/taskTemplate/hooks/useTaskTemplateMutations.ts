import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { TaskTemplate, CreateTaskTemplateDTO } from "../types";
import { taskTemplateService } from "../services/taskTemplate.service";

export const useCreateTaskTemplate = (branchId: number) =>
  useAppMutation<TaskTemplate, CreateTaskTemplateDTO>(
    (data) => taskTemplateService.create(data),
    {
      invalidateKey: queryKeys.taskTemplates.byBranch(branchId),
      successMessage: "Task added",
    }
  );

export const useDeleteTaskTemplate = (branchId: number) =>
  useAppMutation<void, number>((id) => taskTemplateService.remove(id), {
    invalidateKey: queryKeys.taskTemplates.byBranch(branchId),
    successMessage: "Task removed",
  });
