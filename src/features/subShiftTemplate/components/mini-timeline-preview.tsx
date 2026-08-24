import { getTime } from "@/lib/utils/dateTimeHelpers";
import { computeBarPosition, TimeRange } from "../utils/timeRange";

type MiniTimelinePreviewProps = {
  masterRange: TimeRange;
  candidate: { type: "MAIN" | "SUPPORT"; startTime: string; endTime: string };
};

/**
 * Single-row live preview of the sub-shift being added/edited, positioned
 * against the master template's range - so an out-of-bounds time reads as a
 * visual overflow while typing, not just a text error after Save.
 */
export default function SubShiftMiniTimelinePreview({
  masterRange,
  candidate,
}: MiniTimelinePreviewProps) {
  if (!masterRange.startTime || !masterRange.endTime) return null;

  const hasCandidateRange = !!candidate.startTime && !!candidate.endTime;
  const { leftPct, widthPct, isOutOfBounds } = computeBarPosition(masterRange, candidate);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-3 w-full rounded bg-muted">
        {hasCandidateRange && (
          <div
            className={`absolute top-0 h-full rounded ${
              isOutOfBounds
                ? "bg-destructive/70"
                : candidate.type === "MAIN"
                  ? "bg-primary"
                  : "bg-secondary border border-secondary-foreground/20"
            }`}
            style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "8px" }}
          />
        )}
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{getTime(new Date(masterRange.startTime))}</span>
        <span>{getTime(new Date(masterRange.endTime))}</span>
      </div>
    </div>
  );
}
