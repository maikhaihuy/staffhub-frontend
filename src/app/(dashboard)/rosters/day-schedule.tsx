import { dayAnchorId } from "./day-jump-strip";
import { EmptyDayCard } from "./empty-day-card";
import { MasterShiftCard } from "./master-shift-card";
import { MasterShift } from "@/features/masterShift/types";
import { toDateOnlyString, Weekday } from "@/lib/utils/dateTimeHelpers";

interface DayScheduleProps {
  branchId: number;
  day: Weekday;
  masterShifts: MasterShift[];
  colorForTemplate: (templateId: number) => string;
}

export function DaySchedule({ branchId, day, masterShifts, colorForTemplate }: DayScheduleProps) {
  const dayShifts = masterShifts
    .filter((ms) => toDateOnlyString(new Date(ms.workDate)) === toDateOnlyString(day.date))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <section id={dayAnchorId(day.date)} className="scroll-mt-24">
      <div className="flex items-baseline gap-2 mb-3">
        <h3 className="text-lg font-semibold text-foreground">{day.dayName}</h3>
        <span className="text-sm text-muted-foreground">
          {day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>

      {dayShifts.length === 0 ? (
        <EmptyDayCard branchId={branchId} workDate={toDateOnlyString(day.date)} />
      ) : (
        <div className="flex flex-col gap-3">
          {dayShifts.map((masterShift) => (
            <MasterShiftCard
              key={masterShift.id}
              branchId={branchId}
              masterShift={masterShift}
              accentColor={colorForTemplate(masterShift.masterShiftTemplateId ?? 0)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
