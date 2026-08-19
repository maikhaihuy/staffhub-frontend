import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { masterShiftTemplateService } from "../services/masterShiftTemplate.service";
import { MasterShiftTemplate } from "../types";

export const useGetMasterShiftTemplatesByBranch = (branchId: number) =>
  useAppQuery<MasterShiftTemplate[]>(
    queryKeys.masterShiftTemplates.byBranch(branchId),
    () => masterShiftTemplateService.listByBranch(branchId),
    { enabled: !!branchId }
  );

export const useGetMasterShiftTemplate = (id: number) =>
  useAppQuery<MasterShiftTemplate>(
    queryKeys.masterShiftTemplates.detail(id),
    () => masterShiftTemplateService.getById(id),
    { enabled: !!id }
  );
