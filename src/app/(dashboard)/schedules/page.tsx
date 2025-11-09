"use client";

import { BranchScheduleTable } from "./branch-schedule-table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { BranchWithShifts } from "@/features/branch/types/branch.types";
import { Employee } from "@/features/employee/types/employee.types";
import { EmployeeAssignment } from "@/features/roster/types/roster.dto.types";
import {
  ScheduleSlot,
  WeeklySchedule,
} from "@/features/schedule/types/schedule.dto.types";
import {ScheduleWithRosters} from "@/features/schedule/types/schedule.types";
import { useGetBranchesWithShifts } from "@/features/branch/hooks/useBranchQueries";
import { useGetEmployees } from "@/features/employee/hooks";
import { useGetSchedulesByBranch } from "@/features/schedule/hooks/useScheduleQueries";
import { generateWeekdays, getTime } from "@/lib/utils/dateTimeHelpers";
import { getScheduleKey } from "@/lib/utils/scheduleHelpers";
import { Calendar, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { sampleShifts } from "@/mocks/data/shifts";

export default function SchedulesPage() {
  const [loadedSchedules, setLoadedSchedules] = useState<{
    [branchId: string]: WeeklySchedule;
  }>({});
  const [employeesByBranch, setEmployeesByBranch] = useState<Employee[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState(0);
  const weekDays = generateWeekdays(new Date("2025-10-13"));

  const { data: branches, isLoading: isFetchingBranches } =
    useGetBranchesWithShifts();

  const { data: employeesByCurrentRole, isLoading: isFetchingEmployees } =
    useGetEmployees();

  const { data: schedulesByBranch, isLoading: isFetchingSchedules } =
    useGetSchedulesByBranch(selectedBranchId);

  useEffect(() => {
    if (!selectedBranchId || isFetchingSchedules || isFetchingEmployees) return;

    const currentBranch = branches?.find(
      (branch) => branch.id === selectedBranchId
    );
    if (!currentBranch) return;

    loadBranchSchedule(
      currentBranch,
      schedulesByBranch || [],
      employeesByCurrentRole || []
    );
  }, [
    selectedBranchId,
    branches,
    schedulesByBranch,
    employeesByCurrentRole,
    isFetchingSchedules,
    isFetchingEmployees,
  ]);

  const loadBranchSchedule = async (
    currentBranch: BranchWithShifts,
    schedules: ScheduleWithRosters[],
    employees: Employee[]
  ) => {
    if (loadedSchedules[selectedBranchId]) {
      return; // Already loaded
    }

    const shiftsInCurrentBranch = currentBranch.shifts;
    const empoyeeInBranch = employees.filter((emp) =>
      emp.branchIds.includes(selectedBranchId)
    );

    // let schedulesInCurrentBranch = schedules || [];

    // if (!schedules) {
    //   const shiftsInCurrentBranch = currentBranch.shifts;
    //   schedulesInCurrentBranch = weekDays.reduce((list: ScheduleWithRosters[], weekDay) => {
    //     const items = shiftsInCurrentBranch.map((s) => ({
    //       id: 0,
    //       name: s.name,
    //       abbreviation: s.abbreviation,
    //       maxSlots: s.maxSlots,
    //       status: "draft",
    //       branchId: s.branchId,
    //       startTime: s.startTime,
    //       endTime: s.endTime,
    //       note: s.note || '',
    //       shiftId: s.id,
    //       workDate: weekDay.date,
    //     } as ScheduleWithRosters))
    //     return list.concat(items)
    //   }, [])
    // }

    const scheduleInWeek = Object.fromEntries(
      schedules.map((schedule) => {
        const key = getScheduleKey(schedule.shiftId, schedule.workDate);
        const currentShift = shiftsInCurrentBranch.find(
          (s) => s.id === schedule.shiftId
        );

        const assignments = schedule.rosters.map(
          (roster) =>
            ({
              rosterId: roster.id,
              scheduleId: roster.scheduleId,
              employeeId: roster.employeeId,
              employeeName:
                empoyeeInBranch.find((e) => e.id === roster.employeeId)?.name ||
                "",
              startTime: getTime(roster.actualStartAt),
              endTime: getTime(roster.actualEndAt),
              status: roster.status,
              mode: roster.mode,
            } as EmployeeAssignment)
        );

        const scheduleStartDateTime = new Date(schedule.workDate);
        scheduleStartDateTime.setHours(
          schedule.startTime.getHours(),
          schedule.startTime.getMinutes(),
          schedule.startTime.getSeconds(),
          schedule.startTime.getMilliseconds()
        );
        const scheduleEndDateTime = new Date(schedule.workDate);
        scheduleEndDateTime.setHours(
          schedule.endTime.getHours(),
          schedule.endTime.getMinutes(),
          schedule.endTime.getSeconds(),
          schedule.endTime.getMilliseconds()
        );

        return [
          key,
          {
            scheduleId: schedule.id,
            shiftId: schedule.shiftId,
            date: schedule.workDate,
            startTime: getTime(schedule.startTime),
            endTime: getTime(schedule.endTime),
            maxSlots: schedule.maxSlots,
            assignments: assignments,
            status: schedule.status,
            color: currentShift?.color,
          } as ScheduleSlot,
        ];
      })
    );

    setLoadedSchedules((prev) => ({
      ...prev,
      [currentBranch.id]: scheduleInWeek,
    }));
    setEmployeesByBranch(empoyeeInBranch);
  };

  if (isFetchingBranches || isFetchingEmployees) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Schedule Shifts</h2>
        <div className="text-center py-8 text-muted-foreground">
          Loading branches...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Schedule Shifts</h2>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Fully Staffed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
          <span>Understaffed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-yellow-400 rounded"></div>
          <span>Unsaved Changes</span>
        </div>
      </div>

      {/* Schedule Grid */}
      <Accordion type="single" collapsible className="space-y-4">
        {branches!.map((branch) => (
          <AccordionItem key={branch.id} value={branch.id.toString()}>
            <AccordionTrigger
              onClick={() => {
                setSelectedBranchId(branch.id);
              }}
              className="px-6 py-4"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {branch.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {branch.abbreviation}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {loadedSchedules[branch.id] && !isFetchingSchedules ? (
                <BranchScheduleTable
                  branch={branch}
                  employees={employeesByBranch}
                  initialSchedule={loadedSchedules[branch.id]}
                  weekDays={weekDays}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Loading schedule...
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">
              Total Branches
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {branches!.length}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">
              Total Employees
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {employeesByBranch.length}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">
              Shift Templates
            </span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {sampleShifts.length}
          </span>
        </div>
      </div>
    </div>
  );
}
