import { useGetSubShiftTemplatesByMasterShiftTemplate } from "./useSubShiftTemplateQueries";

/**
 * Shared composition summary for a master shift template's sub-shift
 * templates - drives both the Shift Templates list's summary badge and the
 * Weekly Schedule page's generation-eligibility check (a template needs at
 * least one sub-shift template before it can be generated).
 */
export const useSubShiftTemplateComposition = (
  branchId: number,
  masterShiftTemplateId: number
) => {
  const { data: subShiftTemplates = [], isLoading } =
    useGetSubShiftTemplatesByMasterShiftTemplate(branchId, masterShiftTemplateId);

  const mainCount = subShiftTemplates.filter((s) => s.type === "MAIN").length;
  const supportCount = subShiftTemplates.filter((s) => s.type === "SUPPORT").length;

  return {
    subShiftTemplates,
    mainCount,
    supportCount,
    isEligibleForGeneration: subShiftTemplates.length > 0,
    isLoading,
  };
};
