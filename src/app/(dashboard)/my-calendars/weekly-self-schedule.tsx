import { Assignment } from "@/features/assignment/types";
import { getTime, toDateOnlyString, Weekday } from "@/lib/utils/dateTimeHelpers";
import { cn } from "@/lib/utils/cn";
import { CalendarX2 } from "lucide-react";

interface WeeklySelfScheduleProps {
  weekDays: Weekday[];
  assignments: Assignment[];
  branchNameById: Record<number, string>;
}

const DAY_NAME_VI: Record<string, string> = {
  Monday: "Thứ Hai",
  Tuesday: "Thứ Ba",
  Wednesday: "Thứ Tư",
  Thursday: "Thứ Năm",
  Friday: "Thứ Sáu",
  Saturday: "Thứ Bảy",
  Sunday: "Chủ Nhật",
};

export function WeeklySelfSchedule({ weekDays, assignments, branchNameById }: WeeklySelfScheduleProps) {
  const today = toDateOnlyString(new Date());

  const assignmentsByDay = weekDays.map((day) => {
    const dayKey = toDateOnlyString(day.date);
    return {
      day,
      dayKey,
      isToday: dayKey === today,
      assignments: assignments.filter((a) => {
        const workDate = a.subShift?.masterShift?.workDate;
        return workDate && toDateOnlyString(new Date(workDate)) === dayKey;
      }),
    };
  });

  const hasAnyAssignment = assignmentsByDay.some((d) => d.assignments.length > 0);

  if (!hasAnyAssignment) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <CalendarX2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Không có ca làm việc</h3>
        <p className="text-muted-foreground">Bạn chưa được xếp ca nào trong tuần này.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {assignmentsByDay.map(({ day, dayKey, isToday, assignments: dayAssignments }) => (
        <div
          key={dayKey}
          className={cn(
            "rounded-lg border border-border bg-card p-3 min-h-[140px]",
            isToday && "border-primary ring-1 ring-primary"
          )}
        >
          <div className="mb-2">
            <p className={cn("text-sm font-medium", isToday ? "text-primary" : "text-foreground")}>
              {DAY_NAME_VI[day.dayName] ?? day.dayName}
              {isToday && " · Hôm nay"}
            </p>
            <p className="text-xs text-muted-foreground">{day.date.toLocaleDateString()}</p>
          </div>

          {dayAssignments.length === 0 ? (
            <p className="text-xs text-muted-foreground">Không có ca</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dayAssignments.map((assignment) => (
                <div key={assignment.id} className="rounded-md bg-muted/50 p-2 text-xs">
                  <p className="font-medium text-foreground">{assignment.subShift?.title}</p>
                  {assignment.subShift && (
                    <p className="text-muted-foreground">
                      {getTime(new Date(assignment.subShift.startTime))} -{" "}
                      {getTime(new Date(assignment.subShift.endTime))}
                    </p>
                  )}
                  {assignment.subShift?.masterShift && (
                    <p className="text-muted-foreground">
                      {branchNameById[assignment.subShift.masterShift.branchId] ?? "Chi nhánh"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
