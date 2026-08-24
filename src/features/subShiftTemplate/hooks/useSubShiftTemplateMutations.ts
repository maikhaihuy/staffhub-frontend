import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  SubShiftTemplate,
  CreateSubShiftTemplateDTO,
  UpdateSubShiftTemplateInput,
} from "../types";
import { subShiftTemplateService } from "../services/subShiftTemplate.service";

export const useCreateSubShiftTemplate = (branchId: number, masterShiftTemplateId: number) =>
  useAppMutation<SubShiftTemplate, CreateSubShiftTemplateDTO>(
    (data) => subShiftTemplateService.create(data),
    {
      invalidateKey: queryKeys.subShiftTemplates.byMasterShiftTemplate(
        branchId,
        masterShiftTemplateId
      ),
      successMessage: "Sub-shift added",
    }
  );

export const useUpdateSubShiftTemplate = (branchId: number, masterShiftTemplateId: number) =>
  useAppMutation<SubShiftTemplate, UpdateSubShiftTemplateInput>(
    ({ id, ...data }) => subShiftTemplateService.update(id, data),
    {
      invalidateKey: queryKeys.subShiftTemplates.byMasterShiftTemplate(
        branchId,
        masterShiftTemplateId
      ),
      successMessage: "Sub-shift updated",
    }
  );

export const useDeleteSubShiftTemplate = (branchId: number, masterShiftTemplateId: number) =>
  useAppMutation<void, number>((id) => subShiftTemplateService.remove(id), {
    invalidateKey: queryKeys.subShiftTemplates.byMasterShiftTemplate(
      branchId,
      masterShiftTemplateId
    ),
    successMessage: "Sub-shift removed",
  });
