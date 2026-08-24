import { SubShiftTemplateFormValues } from "../types";
import { TimeRange, toMinutes } from "./timeRange";

/**
 * A sub-shift template's time range must fall fully within its master shift
 * template's time range. Returns true when the candidate is out of bounds.
 */
export function findOutOfBoundsConflict(
  candidate: Pick<SubShiftTemplateFormValues, "startTime" | "endTime">,
  masterRange: TimeRange
): boolean {
  if (!candidate.startTime || !candidate.endTime) return false;

  const start = toMinutes(candidate.startTime);
  const end = toMinutes(candidate.endTime);
  const masterStart = toMinutes(masterRange.startTime);
  const masterEnd = toMinutes(masterRange.endTime);

  return start < masterStart || end > masterEnd;
}
