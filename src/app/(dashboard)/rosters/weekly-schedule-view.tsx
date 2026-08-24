import { ElementType } from "react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DayJumpStrip } from "./day-jump-strip";
import { DaySchedule } from "./day-schedule";
import { useGetMasterShiftTemplatesByBranch } from "@/features/masterShiftTemplate/hooks/useMasterShiftTemplateQueries";
import { useGetMasterShiftsByBranch } from "@/features/masterShift/hooks/useMasterShiftQueries";
import { useGenerateMasterShift } from "@/features/masterShift/hooks/useMasterShiftMutations";
import { assignmentService } from "@/features/assignment/services/assignment.service";
import { queryKeys } from "@/lib/queryKeys";
import { toDateOnlyString, Weekday } from "@/lib/utils/dateTimeHelpers";
import { Calendar, Clock, Users } from "lucide-react";

// Presentation-only: the backend has no per-template color, so shift-type
// cards are colored deterministically by template id instead.
const SHIFT_COLORS = [
  "border-l-blue-500",
  "border-l-green-500",
  "border-l-purple-500",
  "border-l-orange-500",
  "border-l-pink-500",
  "border-l-teal-500",
];
const colorForTemplate = (templateId: number) => SHIFT_COLORS[templateId % SHIFT_COLORS.length];

interface WeeklyScheduleViewProps {
  branchId: number;
  weekDays: Weekday[];
}

export function WeeklyScheduleView({ branchId, weekDays }: WeeklyScheduleViewProps) {
  const { data: templates = [] } = useGetMasterShiftTemplatesByBranch(branchId);
  const from = toDateOnlyString(weekDays[0].date);
  const to = toDateOnlyString(weekDays[weekDays.length - 1].date);
  const { data: masterShifts = [] } = useGetMasterShiftsByBranch(branchId, from, to);

  const subShiftIds = masterShifts.flatMap((ms) => ms.subShifts?.map((ss) => ss.id) ?? []);
  // Same query key/fn as useGetAssignmentsBySubShift, so this shares cache
  // with each SubShiftRow's own fetch instead of duplicating requests.
  const assignmentQueries = useQueries({
    queries: subShiftIds.map((id) => ({
      queryKey: queryKeys.assignments.bySubShift(id),
      queryFn: () => assignmentService.listBySubShift(id),
    })),
  });

  const generateMutation = useGenerateMasterShift();

  const handleGenerateWeek = () => {
    templates.forEach((template) => {
      weekDays.forEach(({ date }) => {
        const alreadyExists = masterShifts.some(
          (ms) =>
            ms.masterShiftTemplateId === template.id &&
            toDateOnlyString(new Date(ms.workDate)) === toDateOnlyString(date)
        );
        if (!alreadyExists) {
          generateMutation.mutate({
            masterShiftTemplateId: template.id,
            workDate: toDateOnlyString(date),
          });
        }
      });
    });
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <DayJumpStrip weekDays={weekDays} />
        <Button
          variant="default"
          onClick={handleGenerateWeek}
          disabled={generateMutation.isPending || templates.length === 0}
        >
          Generate this week
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat icon={Calendar} label="Total Shifts" value={masterShifts.length} />
        <SummaryStat icon={Users} label="Total Assignments" value={totalAssignments} />
        <SummaryStat icon={Clock} label="Total Capacity" value={totalCapacity} />
        <SummaryStat icon={Users} label="Active Employees" value={activeEmployeeIds.size} />
      </div>

      <div className="flex flex-col gap-6">
        {weekDays.map((day) => (
          <DaySchedule
            key={day.date.toDateString()}
            branchId={branchId}
            day={day}
            masterShifts={masterShifts}
            colorForTemplate={colorForTemplate}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-xl font-bold text-foreground">{value}</span>
    </div>
  );
}
