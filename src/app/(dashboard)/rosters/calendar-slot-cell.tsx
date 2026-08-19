import { MasterShift } from "@/features/masterShift/types";
import { useGetAssignmentsBySubShift } from "@/features/assignment/hooks/useAssignmentQueries";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import { Clock, Users } from "lucide-react";

interface CalendarSlotCellProps {
  color: string;
  masterShift: MasterShift;
}

export function CalendarSlotCell({ color, masterShift }: CalendarSlotCellProps) {
  // The frontend currently auto-creates exactly one default sub-shift per
  // master shift, so this is "the" sub-shift for this cell.
  const subShift = masterShift.subShifts?.[0];
  const { data: assignments = [] } = useGetAssignmentsBySubShift(subShift?.id ?? 0);

  if (!subShift) {
    return (
      <div className={`${color} rounded-lg p-3 text-white h-full opacity-60`}>
        <span className="text-xs">No sub-shift configured</span>
      </div>
    );
  }

  return (
    <div className={`${color} rounded-lg p-3 text-white h-full`}>
      <div className="flex flex-row justify-between mb-2 rounded-b-lg">
        <div className="flex items-center gap-1 mb-2">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">
            {getTime(new Date(subShift.startTime))} - {getTime(new Date(subShift.endTime))}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <Users className="h-3 w-3" />
          <span className="text-xs font-medium">
            {assignments.length}
            {subShift.maxAssignments ? ` / ${subShift.maxAssignments}` : ""}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {assignments.map((assignment) => {
          // "Adjusted" now means real attendance (check-in/out) deviates
          // from the sub-shift's scheduled time - there's no per-assignment
          // custom schedule anymore, only actual clock times.
          const hasActualTime = assignment.actualStartTime && assignment.actualEndTime;
          const isAdjusted =
            hasActualTime &&
            (getTime(new Date(assignment.actualStartTime!)) !== getTime(new Date(subShift.startTime)) ||
              getTime(new Date(assignment.actualEndTime!)) !== getTime(new Date(subShift.endTime)));

          return (
            <div
              key={assignment.id}
              className="flex flex-col text-xs bg-white/20 rounded px-2 py-1 gap-0.5"
            >
              <span className="text-xs font-medium truncate">
                {assignment.employee?.fullName ?? "Unknown"}
              </span>
              {hasActualTime ? (
                <span
                  className={`text-xs font-medium ${isAdjusted ? "text-red-200" : ""}`}
                  title={isAdjusted ? "Adjusted time" : undefined}
                >
                  {getTime(new Date(assignment.actualStartTime!))} -{" "}
                  {getTime(new Date(assignment.actualEndTime!))}
                </span>
              ) : (
                <span className="text-xs font-medium opacity-70">{assignment.status}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
