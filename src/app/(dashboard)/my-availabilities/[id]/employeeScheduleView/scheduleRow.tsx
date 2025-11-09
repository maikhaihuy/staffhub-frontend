import { ROSTER_MODE } from "@/constants";
import { Roster } from "@/features/roster/types/roster.types";
import { ScheduleGroup } from "@/features/schedule/types/schedule.types";
import AssignmentItem from "./assignment-item";

export function ScheduleRow({
  group,
  rosterByEmployee,
  weekDays,
}: {
  group: ScheduleGroup;
  rosterByEmployee: Roster[];
  weekDays: { dayName: string; date: Date }[];
}) {
  return (
    <tr key={group.timeRange} className="border-b border-border last:border-0">
      <td className="px-4 py-3 border-r border-border text-sm font-medium text-foreground">
        {group.name} <br />
        <span className="text-xs text-muted-foreground">{group.timeRange}</span>
      </td>
      {weekDays.map(({ date }) => {
        // Find schedule for this day
        const schedule = group.schedules.find(
          (s) => s.workDate.toDateString() === date.toDateString()
        );

        if (!schedule) {
          return (
            <td
              key={date.toDateString()}
              className="px-4 py-3 border-r border-border last:border-r-0"
            >
              <div className="text-xs text-muted-foreground text-center">-</div>
            </td>
          );
        }

        const roster = rosterByEmployee?.find(
          (r) => r.scheduleId === schedule.id
        );

        return (
          <td
            key={date.toDateString()}
            className="px-2 py-2 border-r border-border last:border-r-0"
          >
            {roster ? (
              <AssignmentItem roster={roster} />
            ) : (
              <AssignmentItem
                roster={{
                  actualDate: date,
                  actualStartAt: schedule.startTime,
                  actualEndAt: schedule.endTime,
                  status: "", // Initial state
                  mode: ROSTER_MODE.REQUEST,
                  note: "",
                  employeeId: 0, // get from current userId
                  scheduleId: schedule.id,
                  id: 0,
                  assignedAt: new Date(),
                }}
              />
            )}
          </td>
        );
      })}
    </tr>
  );
}
