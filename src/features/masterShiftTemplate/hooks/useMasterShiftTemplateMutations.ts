import { useQueryClient } from "@tanstack/react-query";
import { FormErrorSetter, useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  MasterShiftTemplate,
  CreateMasterShiftTemplateDTO,
  UpdateMasterShiftTemplateInput,
} from "../types";
import { masterShiftTemplateService } from "../services/masterShiftTemplate.service";

export const useCreateMasterShiftTemplate = (branchId: number, form?: FormErrorSetter) =>
  useAppMutation<MasterShiftTemplate, CreateMasterShiftTemplateDTO>(
    (data) => masterShiftTemplateService.create(data),
    {
      invalidateKey: queryKeys.masterShiftTemplates.byBranch(branchId),
      successMessage: "Shift template created",
      form,
    }
  );

export const useUpdateMasterShiftTemplate = (branchId: number, form?: FormErrorSetter) => {
  const queryClient = useQueryClient();
  return useAppMutation<MasterShiftTemplate, UpdateMasterShiftTemplateInput>(
    ({ id, ...data }) => masterShiftTemplateService.update(id, data),
    {
      invalidateKey: queryKeys.masterShiftTemplates.byBranch(branchId),
      successMessage: "Shift template updated",
      form,
      // The detail page reads the by-id query directly, so it needs its own
      // invalidation - invalidateKey only covers the by-branch list.
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.masterShiftTemplates.detail(data.id),
        });
      },
    }
  );
};

export const useDeleteMasterShiftTemplate = (branchId: number) =>
  useAppMutation<void, number>((id) => masterShiftTemplateService.remove(id), {
    invalidateKey: queryKeys.masterShiftTemplates.byBranch(branchId),
    successMessage: "Shift template deleted",
  });
