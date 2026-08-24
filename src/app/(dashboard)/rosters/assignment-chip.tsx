import { Badge } from "@/components/ui/badge";
import { Assignment } from "@/features/assignment/types";
import { SubShiftLite } from "@/features/subShift/types";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import { cn } from "@/lib/utils/cn";

interface AssignmentChipProps {
  assignment: Assignment;
  subShift: SubShiftLite;
  ineligible?: boolean;
  showName?: boolean;
}

// "Adjusted" means real attendance (check-in/out) deviates from the
// sub-shift's scheduled time - there's no per-assignment custom schedule,
// only actual clock times.
export function AssignmentChip({ assignment, subShift, ineligible, showName = true }: AssignmentChipProps) {
  const hasActualTime = assignment.actualStartTime && assignment.actualEndTime;
  const isAdjusted =
    hasActualTime &&
    (getTime(new Date(assignment.actualStartTime!)) !== getTime(new Date(subShift.startTime)) ||
      getTime(new Date(assignment.actualEndTime!)) !== getTime(new Date(subShift.endTime)));

  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs">
      {showName && <span className="font-medium">{assignment.employee?.fullName ?? "Unknown"}</span>}
      {hasActualTime ? (
        <span className={cn(isAdjusted && "text-destructive")} title={isAdjusted ? "Adjusted time" : undefined}>
          {getTime(new Date(assignment.actualStartTime!))} - {getTime(new Date(assignment.actualEndTime!))}
        </span>
      ) : (
        <span className="text-muted-foreground">{assignment.status}</span>
      )}
      {ineligible && (
        <Badge
          variant="outline"
          className="border-amber-500 text-amber-700 dark:text-amber-400 text-[10px] px-1 py-0"
        >
          no longer in this branch
        </Badge>
      )}
    </div>
  );
}
