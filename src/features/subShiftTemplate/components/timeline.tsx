import { getTime } from "@/lib/utils/dateTimeHelpers";
import { SubShiftTemplate } from "../types";
import { computeBarPosition, TimeRange, toMinutes } from "../utils/timeRange";

type SubShiftTemplateTimelineProps = {
  masterLabel: string;
  masterRange: TimeRange;
  subShiftTemplates: SubShiftTemplate[];
};

const formatRange = (range: TimeRange) =>
  `${getTime(new Date(range.startTime))} - ${getTime(new Date(range.endTime))}`;

function buildTicks(masterRange: TimeRange) {
  const start = toMinutes(masterRange.startTime);
  const end = toMinutes(masterRange.endTime);
  const span = end - start;
  if (span <= 0) return [];

  const stepMinutes = span > 360 ? 120 : 60;
  const ticks: { pct: number; label: string }[] = [];
  for (let m = start; m <= end; m += stepMinutes) {
    const hh = Math.floor(m / 60)
      .toString()
      .padStart(2, "0");
    ticks.push({ pct: ((m - start) / span) * 100, label: `${hh}h` });
  }
  return ticks;
}

function TimelineRow({
  label,
  sublabel,
  barClassName,
  leftPct,
  widthPct,
}: {
  label: string;
  sublabel: string;
  barClassName: string;
  leftPct: number;
  widthPct: number;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="w-full shrink-0 text-xs sm:w-32 sm:truncate" title={`${label} ${sublabel}`}>
        <span className="font-medium">{label}</span>{" "}
        <span className="text-muted-foreground">{sublabel}</span>
      </div>
      <div className="relative h-4 w-full min-w-[80px] rounded bg-muted">
        <div
          className={`absolute top-0 h-full rounded ${barClassName}`}
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "12px" }}
        />
      </div>
    </div>
  );
}

export default function SubShiftTemplateTimeline({
  masterLabel,
  masterRange,
  subShiftTemplates,
}: SubShiftTemplateTimelineProps) {
  const hasMasterRange = !!masterRange.startTime && !!masterRange.endTime;
  const mainRows = subShiftTemplates
    .filter((s) => s.type === "MAIN")
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
  const supportRows = subShiftTemplates
    .filter((s) => s.type === "SUPPORT")
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  if (!hasMasterRange) return null;

  const ticks = buildTicks(masterRange);

  return (
    <div className="flex flex-col gap-1.5 rounded-md border p-3">
      <TimelineRow
        label={masterLabel}
        sublabel={formatRange(masterRange)}
        barClassName="bg-muted-foreground/20 border border-muted-foreground/40"
        leftPct={0}
        widthPct={100}
      />

      {subShiftTemplates.length === 0 ? (
        <p className="pl-1 text-xs text-muted-foreground">Add a sub-shift to see it here.</p>
      ) : (
        [...mainRows, ...supportRows].map((subShiftTemplate) => {
          const { leftPct, widthPct } = computeBarPosition(masterRange, subShiftTemplate);
          return (
            <TimelineRow
              key={subShiftTemplate.id}
              label={subShiftTemplate.name}
              sublabel={formatRange(subShiftTemplate)}
              barClassName={
                subShiftTemplate.type === "MAIN"
                  ? "bg-primary"
                  : "bg-secondary border border-secondary-foreground/20"
              }
              leftPct={leftPct}
              widthPct={widthPct}
            />
          );
        })
      )}

      {ticks.length > 1 && (
        <div className="hidden sm:ml-[8.75rem] sm:flex sm:justify-between sm:text-[10px] sm:text-muted-foreground">
          {ticks.map((tick) => (
            <span key={tick.pct}>{tick.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
