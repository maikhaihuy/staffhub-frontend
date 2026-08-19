import { MasterShiftTemplate } from "@/features/masterShiftTemplate/types";
import { MasterShift } from "@/features/masterShift/types";
import { Assignment } from "@/features/assignment/types";
import { Weekday, getTime, toDateOnlyString } from "@/lib/utils/dateTimeHelpers";
import AssignmentItem from "./assignment-item";

export function ScheduleRow({
  employeeId,
  template,
  masterShifts,
  myAssignments,
  weekDays,
}: {
  employeeId: number;
  template: MasterShiftTemplate;
  masterShifts: MasterShift[];
  myAssignments: Assignment[];
  weekDays: Weekday[];
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 border-r border-border text-sm font-medium text-foreground">
        {template.name} <br />
        <span className="text-xs text-muted-foreground">
          {getTime(new Date(template.startTime))} -{" "}
          {getTime(new Date(template.endTime))}
        </span>
      </td>
      {weekDays.map(({ date }) => {
        // Find the master shift generated from this template for this day
        const masterShift = masterShifts.find(
          (ms) =>
            ms.masterShiftTemplateId === template.id &&
            toDateOnlyString(new Date(ms.workDate)) === toDateOnlyString(date)
        );
        // Exactly one auto-created sub-shift per master shift today
        const subShift = masterShift?.subShifts?.[0];

        if (!masterShift || !subShift) {
          return (
            <td
              key={date.toDateString()}
              className="px-4 py-3 border-r border-border last:border-r-0"
            >
              <div className="text-xs text-muted-foreground text-center">-</div>
            </td>
          );
        }

        const existingAssignment = myAssignments.find(
          (a) => a.subShiftId === subShift.id
        );

        return (
          <td
            key={date.toDateString()}
            className="px-2 py-2 border-r border-border last:border-r-0"
          >
            <AssignmentItem
              employeeId={employeeId}
              subShift={subShift}
              assignment={existingAssignment}
            />
          </td>
        );
      })}
    </tr>
  );
}
