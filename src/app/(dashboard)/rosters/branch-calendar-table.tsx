import { CalendarSlotCell } from "./calendar-slot-cell";
import { Button } from "@/components/ui/button";
import { BranchWithShifts } from "@/features/branch/types";
import { ScheduleWithRosters } from "@/features/schedule/types";
import { getTime, Weekday } from "@/utils/dateTimeHelpers";
import { Employee } from "@/features/employee/types";
import { Calendar, Clock, Download, FileText, Users } from "lucide-react";

interface BranchCalendarTableProps {
  branch: BranchWithShifts;
  employees: Employee[];
  schedules: ScheduleWithRosters[];
  weekDays: Weekday[];
}

export function BranchCalendarTable({
  branch,
  employees,
  schedules,
  weekDays,
}: BranchCalendarTableProps) {
  const exportToExcel = () => {
    // Here you would implement Excel export functionality
    console.log("Exporting to Excel...");
    // Show success message
  };

  const exportToPDF = () => {
    // Here you would implement PDF export functionality
    console.log("Exporting to PDF...");
    // Show success message
  };

  return (
    <div className="space-y-6">
      {/* Export buttons */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-transparent"
        >
          <FileText className="h-4 w-4" />
          Export to Excel
        </Button>
        <Button
          variant="outline"
          onClick={exportToPDF}
          className="flex items-center gap-2 bg-transparent"
        >
          <Download className="h-4 w-4" />
          Export to PDF
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm flex-wrap">
        <span className="font-medium text-foreground">Shift Types:</span>
        {branch.shifts.map((shift) => (
          <div key={shift.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${shift.color} rounded`}></div>
            <span className="text-muted-foreground">
              {shift.name} ({getTime(shift.startTime)} -{" "}
              {getTime(shift.endTime)})
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 min-w-[800px]">
            {/* Header row */}
            <div className="bg-muted/50 border-b border-border p-4">
              <span className="text-sm font-medium text-muted-foreground">
                Time
              </span>
            </div>
            {weekDays.map(({ dayName, date }) => (
              <div
                key={date.toDateString()}
                className="bg-muted/50 border-b border-l border-border p-4 text-center"
              >
                <div className="text-sm font-medium text-foreground">
                  {dayName}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {date.toDateString()}
                </div>
              </div>
            ))}

            {/* Time slots and shifts */}
            {branch.shifts.map((shift) => (
              <div key={shift.id} className="contents">
                {/* Time slot label */}
                <div className="border-b border-border p-4 bg-muted/20">
                  <div className="text-sm font-medium text-foreground">
                    {shift.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {getTime(shift.startTime)} - {getTime(shift.endTime)}
                  </div>
                </div>

                {/* Daily shift blocks */}
                {weekDays.map(({ date }) => {
                  const currentSchedule = schedules.find(
                    (s) =>
                      s.shiftId === shift.id &&
                      s.workDate.toDateString() === date.toDateString()
                  ) as ScheduleWithRosters;

                  return (
                    <div
                      key={`${shift.id}-${date.toDateString()}`}
                      className="border-b border-l border-border p-2 min-h-[80px]"
                    >
                      {currentSchedule && (
                        <CalendarSlotCell
                          shift={shift}
                          currentSchedule={currentSchedule}
                          employees={employees}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">
              Total Shifts
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {schedules.length}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">
              Total Assignments
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {schedules.reduce(
              (total, schedule) => total + schedule.rosters.length,
              0
            )}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">
              Avg per Shift
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Math.round(
              schedules.reduce(
                (total, schedule) => total + schedule.rosters.length,
                0
              ) / schedules.length
            )}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-foreground">
              Active Employees
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {new Set(schedules.flatMap((schedule) => schedule.rosters)).size}
          </span>
        </div>
      </div>
    </div>
  );
}
