import { useQueries } from "@tanstack/react-query";
import { CalendarSlotCell } from "./calendar-slot-cell";
import { Button } from "@/components/ui/button";
import { useGetMasterShiftTemplatesByBranch } from "@/features/masterShiftTemplate/hooks/useMasterShiftTemplateQueries";
import { useGetMasterShiftsByBranch } from "@/features/masterShift/hooks/useMasterShiftQueries";
import { assignmentService } from "@/features/assignment/services/assignment.service";
import { queryKeys } from "@/lib/queryKeys";
import { getTime, toDateOnlyString, Weekday } from "@/lib/utils/dateTimeHelpers";
import { Calendar, Clock, Download, FileText, Users } from "lucide-react";

// Presentation-only: the backend has no per-template color, so shift-type
// rows are colored deterministically by template id instead.
const SHIFT_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];
const colorForTemplate = (templateId: number) => SHIFT_COLORS[templateId % SHIFT_COLORS.length];

interface BranchCalendarTableProps {
  branchId: number;
  weekDays: Weekday[];
}

export function BranchCalendarTable({ branchId, weekDays }: BranchCalendarTableProps) {
  const { data: templates = [] } = useGetMasterShiftTemplatesByBranch(branchId);
  const from = toDateOnlyString(weekDays[0].date);
  const to = toDateOnlyString(weekDays[weekDays.length - 1].date);
  const { data: masterShifts = [] } = useGetMasterShiftsByBranch(branchId, from, to);

  const subShiftIds = masterShifts.flatMap((ms) => ms.subShifts?.map((ss) => ss.id) ?? []);
  // Same query key/fn as useGetAssignmentsBySubShift, so this shares cache
  // with each CalendarSlotCell's own fetch instead of duplicating requests.
  const assignmentQueries = useQueries({
    queries: subShiftIds.map((id) => ({
      queryKey: queryKeys.assignments.bySubShift(id),
      queryFn: () => assignmentService.listBySubShift(id),
    })),
  });

  const exportToExcel = () => {
    console.log("Exporting to Excel...");
  };

  const exportToPDF = () => {
    console.log("Exporting to PDF...");
  };

  const totalAssignments = assignmentQueries.reduce((sum, q) => sum + (q.data?.length ?? 0), 0);
  const totalCapacity = masterShifts.reduce(
    (sum, ms) => sum + (ms.subShifts?.reduce((s, ss) => s + (ss.maxAssignments ?? 0), 0) ?? 0),
    0
  );
  const activeEmployeeIds = new Set(
    assignmentQueries.flatMap((q) => q.data?.map((a) => a.employeeId) ?? [])
  );

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
        {templates.map((template) => (
          <div key={template.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${colorForTemplate(template.id)} rounded`}></div>
            <span className="text-muted-foreground">
              {template.name} ({getTime(new Date(template.startTime))} -{" "}
              {getTime(new Date(template.endTime))})
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
            {templates.map((template) => (
              <div key={template.id} className="contents">
                {/* Time slot label */}
                <div className="border-b border-border p-4 bg-muted/20">
                  <div className="text-sm font-medium text-foreground">
                    {template.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {getTime(new Date(template.startTime))} - {getTime(new Date(template.endTime))}
                  </div>
                </div>

                {/* Daily shift blocks */}
                {weekDays.map(({ date }) => {
                  const currentMasterShift = masterShifts.find(
                    (ms) =>
                      ms.masterShiftTemplateId === template.id &&
                      toDateOnlyString(new Date(ms.workDate)) === toDateOnlyString(date)
                  );

                  return (
                    <div
                      key={`${template.id}-${date.toDateString()}`}
                      className="border-b border-l border-border p-2 min-h-20"
                    >
                      {currentMasterShift && (
                        <CalendarSlotCell
                          color={colorForTemplate(template.id)}
                          masterShift={currentMasterShift}
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
            {masterShifts.length}
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
            {totalAssignments}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">
              Total Capacity
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {totalCapacity}
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
            {activeEmployeeIds.size}
          </span>
        </div>
      </div>
    </div>
  );
}
