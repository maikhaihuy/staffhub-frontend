import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { subShiftTemplateService } from "../services/subShiftTemplate.service";
import { SubShiftTemplate } from "../types";

export const useGetSubShiftTemplatesByMasterShiftTemplate = (
  branchId: number,
  masterShiftTemplateId: number
) =>
  useAppQuery<SubShiftTemplate[]>(
    queryKeys.subShiftTemplates.byMasterShiftTemplate(branchId, masterShiftTemplateId),
    () => subShiftTemplateService.listByMasterShiftTemplate(branchId, masterShiftTemplateId),
    { enabled: !!branchId && !!masterShiftTemplateId }
  );
