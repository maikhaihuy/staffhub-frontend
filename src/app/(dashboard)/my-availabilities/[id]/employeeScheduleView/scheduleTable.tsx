import { MasterShiftTemplate } from "@/features/masterShiftTemplate/types";
import { MasterShift } from "@/features/masterShift/types";
import { Assignment } from "@/features/assignment/types";
import { Weekday } from "@/lib/utils/dateTimeHelpers";
import { ScheduleRow } from "./scheduleRow";

interface ScheduleTableProps {
  employeeId: number;
  templates: MasterShiftTemplate[];
  masterShifts: MasterShift[];
  myAssignments: Assignment[];
  weekDays: Weekday[];
}

export default function ScheduleTable({
  employeeId,
  templates,
  masterShifts,
  myAssignments,
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
        {templates.map((template) => (
          <ScheduleRow
            key={template.id}
            employeeId={employeeId}
            template={template}
            masterShifts={masterShifts}
            myAssignments={myAssignments}
            weekDays={weekDays}
          />
        ))}
      </tbody>
    </table>
  );
}
