import { SubShiftTemplate, SubShiftTemplateFormValues } from "../types";
import { rangesOverlap, toMinutes } from "./timeRange";

/**
 * MAIN sub-shift templates on the same master shift template cannot overlap
 * in time; SUPPORT is unrestricted. Returns the first conflicting sibling,
 * or null if the candidate is SUPPORT or has no conflict.
 */
export function findMainOverlapConflict(
  candidate: Pick<SubShiftTemplateFormValues, "type" | "startTime" | "endTime">,
  siblings: SubShiftTemplate[],
  excludeId?: number
): SubShiftTemplate | null {
  if (candidate.type !== "MAIN") return null;
  if (!candidate.startTime || !candidate.endTime) return null;

  const start = toMinutes(candidate.startTime);
  const end = toMinutes(candidate.endTime);

  const conflict = siblings.find(
    (sibling) =>
      sibling.type === "MAIN" &&
      sibling.id !== excludeId &&
      rangesOverlap(start, end, toMinutes(sibling.startTime), toMinutes(sibling.endTime))
  );

  return conflict ?? null;
}
