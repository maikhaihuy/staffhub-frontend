import { Button } from "@/components/ui/button";
import { toDateOnlyString, Weekday } from "@/lib/utils/dateTimeHelpers";

export const dayAnchorId = (date: Date) => `day-${toDateOnlyString(date)}`;

interface DayJumpStripProps {
  weekDays: Weekday[];
}

// Jumps within the already-displayed week - does not change the week anchor
// or trigger a re-fetch, only scrolls to the matching DaySchedule section.
export function DayJumpStrip({ weekDays }: DayJumpStripProps) {
  const scrollToDay = (date: Date) => {
    document.getElementById(dayAnchorId(date))?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
      {weekDays.map((day) => (
        <Button
          key={day.date.toDateString()}
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => scrollToDay(day.date)}
        >
          {day.dayName.slice(0, 3)}
        </Button>
      ))}
    </div>
  );
}
