import { Roster } from "@/features/roster/types/roster.types";
import { ScheduleGroup } from "@/features/schedule/types/schedule.types";
import { ScheduleRow } from "./scheduleRow";

interface ScheduleTableProps {
  scheduleInWeek: Record<string, ScheduleGroup>;
  rosterByEmployee: Roster[];
  weekDays: { dayName: string; date: Date }[];
}

export default function ScheduleTable({
  scheduleInWeek,
  rosterByEmployee,
  weekDays,
}: ScheduleTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border bg-muted/50">
          <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground min-w-[100px]">
            Shift
          </th>
          {weekDays.map(({ dayName, date }) => (
            <th
              key={date.toDateString().slice(4, 10)}
              className="px-4 py-3 text-center text-sm font-medium text-muted-foreground min-w-[150px]"
            >
              {dayName} <br /> {date.toDateString().slice(4, 10)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.values(scheduleInWeek).map((group, index) => (
          <ScheduleRow
            key={index}
            group={group}
            rosterByEmployee={rosterByEmployee}
            weekDays={weekDays}
          />
        ))}
      </tbody>
    </table>
  );
}
