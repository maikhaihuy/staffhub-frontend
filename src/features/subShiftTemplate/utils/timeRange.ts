import { getTime } from "@/lib/utils/dateTimeHelpers";

export type TimeRange = { startTime: string; endTime: string };

// Accepts either a raw "HH:mm" (in-progress form field) or a full
// backend-serialized datetime string (already-saved sibling) and normalizes
// both to minutes-since-midnight for comparison.
export const toMinutes = (time: string) => {
  const hhmm = /^\d{2}:\d{2}$/.test(time) ? time : getTime(new Date(time));
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
};

export const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

export type BarPosition = {
  leftPct: number;
  widthPct: number;
  isOutOfBounds: boolean;
};

/**
 * Positions a sub-range as a percentage bar against a master range, for the
 * timeline and mini-preview components. Clamps the visible bar to the
 * master's bounds (so an out-of-range candidate still renders something
 * sensible while typing) but flags `isOutOfBounds` whenever the sub-range
 * isn't fully contained.
 */
export function computeBarPosition(masterRange: TimeRange, subRange: TimeRange): BarPosition {
  const masterStart = toMinutes(masterRange.startTime);
  const masterEnd = toMinutes(masterRange.endTime);
  const masterDuration = masterEnd - masterStart;

  if (masterDuration <= 0 || !subRange.startTime || !subRange.endTime) {
    return { leftPct: 0, widthPct: 0, isOutOfBounds: false };
  }

  const subStart = toMinutes(subRange.startTime);
  const subEnd = toMinutes(subRange.endTime);

  const isOutOfBounds = subStart < masterStart || subEnd > masterEnd;

  const clampedStart = Math.max(subStart, masterStart);
  const clampedEnd = Math.min(subEnd, masterEnd);

  const leftPct = ((clampedStart - masterStart) / masterDuration) * 100;
  const widthPct = Math.max(((clampedEnd - clampedStart) / masterDuration) * 100, 0);

  return { leftPct, widthPct, isOutOfBounds };
}
