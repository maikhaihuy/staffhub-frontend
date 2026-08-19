import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  MasterShiftTemplate,
  CreateMasterShiftTemplateDTO,
  UpdateMasterShiftTemplateInput,
} from "../types";
import { masterShiftTemplateService } from "../services/masterShiftTemplate.service";

export const useCreateMasterShiftTemplate = (branchId: number) =>
  useAppMutation<MasterShiftTemplate, CreateMasterShiftTemplateDTO>(
    (data) => masterShiftTemplateService.create(data),
    {
      invalidateKey: queryKeys.masterShiftTemplates.byBranch(branchId),
      successMessage: "Shift template created",
    }
  );

export const useUpdateMasterShiftTemplate = (branchId: number) =>
  useAppMutation<MasterShiftTemplate, UpdateMasterShiftTemplateInput>(
    ({ id, ...data }) => masterShiftTemplateService.update(id, data),
    {
      invalidateKey: queryKeys.masterShiftTemplates.byBranch(branchId),
      successMessage: "Shift template updated",
    }
  );

export const useDeleteMasterShiftTemplate = (branchId: number) =>
  useAppMutation<void, number>((id) => masterShiftTemplateService.remove(id), {
    invalidateKey: queryKeys.masterShiftTemplates.byBranch(branchId),
    successMessage: "Shift template deleted",
  });
