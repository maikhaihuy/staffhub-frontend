import { Button } from "@/components/ui/button";
import { Weekday } from "@/lib/utils/dateTimeHelpers";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigatorProps {
  weekDays: Weekday[];
  onPrevious: () => void;
  onNext: () => void;
  onThisWeek: () => void;
}

export function WeekNavigator({ weekDays, onPrevious, onNext, onThisWeek }: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="icon" aria-label="Previous week" onClick={onPrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={onThisWeek}>
        This week
      </Button>
      <Button variant="outline" size="icon" aria-label="Next week" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        {weekDays[0].date.toLocaleDateString()} - {weekDays[6].date.toLocaleDateString()}
      </span>
    </div>
  );
}
