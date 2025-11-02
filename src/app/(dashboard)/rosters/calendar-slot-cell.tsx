import { EmployeeWithAvailabilities } from "@/features/employee/types";
import { ScheduleWithRosters } from "@/features/schedule/types";
import { Shift } from "@/features/shift/types";
import { getTime } from "@/utils/dateTimeHelpers";
import { Clock, Users } from "lucide-react";

interface CalendarSlotCellProps {
  shift: Shift;
  currentSchedule: ScheduleWithRosters;
  employees: EmployeeWithAvailabilities[];
}

export function CalendarSlotCell({
  shift,
  currentSchedule,
  employees,
}: CalendarSlotCellProps) {
  const getShiftColor = () => shift?.color || "bg-gray-500";
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId);
    return employee?.name || "Unknown";
  };

  return (
    <div className={`${getShiftColor()} rounded-lg p-3 text-white h-full`}>
      <div className="flex flex-row justify-between mb-2 rounded-b-lg">
        <div className="flex items-center gap-1 mb-2">
          <Clock className="h-3 w-3" />
          <span className="text-xs font-medium">
            {getTime(currentSchedule.startTime)} -{" "}
            {getTime(currentSchedule.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-1 mb-2">
          <Users className="h-3 w-3" />
          <span className="text-xs font-medium">
            {currentSchedule.rosters.length} / {currentSchedule.maxSlots}
          </span>
        </div>
      </div>
      <div className="space-y-1">
        {currentSchedule.rosters &&
          currentSchedule.rosters.map((roster) => (
            <div
              key={roster.id}
              className="flex flex-row justify-between text-xs bg-white/20 rounded px-2 py-1"
            >
              <span className="text-xs font-medium">
                {getEmployeeName(roster.employeeId)}
              </span>
              {getTime(roster.actualStartAt) !== getTime(shift.startTime) ||
              getTime(roster.actualEndAt) !== getTime(shift.endTime) ? (
                <span
                  className="text-xs font-medium text-red-200"
                  title="Adjusted time"
                >
                  {getTime(roster.actualStartAt)} -{" "}
                  {getTime(roster.actualEndAt)}
                </span>
              ) : (
                <span className="text-xs font-medium">
                  {getTime(roster.actualStartAt)} -{" "}
                  {getTime(roster.actualEndAt)}
                </span>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
