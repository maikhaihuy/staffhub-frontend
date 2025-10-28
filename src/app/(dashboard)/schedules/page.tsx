'use client';

import { Employee, sampleEmployees } from "@/features/employee/types";
import { Schedule, ScheduleSlot, WeeklySchedule } from "@/features/schedule/types";
import { sampleShifts, Shift } from "@/features/shift/types";
import { useEffect, useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getBranchesByCurrentRole, getSchedulesByBranch } from "@/features/branch/api";
import { useQuery } from "@tanstack/react-query";
import { getEmployeesWithAvailabilities } from "@/features/employee/api";
import { getShiftsByCurrentRole } from "@/features/shift/api";
import { BranchScheduleTable } from "./branch-schedule-table"
import { getRostersByCurrentWeek } from "@/features/roster/api";
import { EmployeeAssignment, Roster } from "@/features/roster/types";
import { generateWeekdays, getTime } from "@/utils/dateTimeHelpers";
import { getScheduleKey } from "@/utils/scheduleHelpers";

export default function SchedulesPage() {
  const [loadedSchedules, setLoadedSchedules] = useState<{ [branchId: string]: WeeklySchedule }>({})
  const [employeesByBranch, setEmployeesByBranch] = useState<Employee[]>([]);
  const [shiftsByBranch, setShiftsByBranch] = useState<Shift[]>([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState(0);
  const weekDays = generateWeekdays(new Date("2025-10-13"));

  const { data: branches, isLoading: isFetchingBranches } = useQuery({
    queryKey: ["getBranchesByCurrentRole"],
    queryFn: () => getBranchesByCurrentRole(),
  });

  const { data: employeesByCurrentRole, isLoading: isFetchingEmployees } = useQuery({
    queryKey: ["getEmployeesWithAvailabilities"],
    queryFn: () => getEmployeesWithAvailabilities()
  })

  const { data: shiftsByCurrentRole, isLoading: isFetchingShifts} = useQuery({
    queryKey: ["getShiftsByCurrentRole"],
    queryFn: () => getShiftsByCurrentRole(),
  })

  const { data: schedulesByBranch, isLoading: isFetchingSchedules} = useQuery({
    queryKey: ["getSchedulesByBranch", selectedBranchId],
    queryFn: () => getSchedulesByBranch(selectedBranchId),
    enabled: !!selectedBranchId
  })

  const { data: rostersByBranch, isLoading: isFetchingRosters } = useQuery({
    queryKey: ["getRostersByCurrentWeek", selectedBranchId],
    queryFn: () => getRostersByCurrentWeek(selectedBranchId),
    enabled: !!selectedBranchId
  })

  useEffect(() => {
    if (!selectedBranchId || isFetchingRosters || isFetchingSchedules || isFetchingShifts || isFetchingEmployees) return;

    loadBranchSchedule(selectedBranchId, rostersByBranch || [], schedulesByBranch || [], shiftsByCurrentRole || [], employeesByCurrentRole || []);
  }, [selectedBranchId, rostersByBranch, schedulesByBranch, shiftsByCurrentRole, employeesByCurrentRole, isFetchingRosters, isFetchingSchedules, isFetchingShifts, isFetchingEmployees]);
  
  const loadBranchSchedule = async (branchId: number, rosters: Roster[], schedules: Schedule[], shifts: Shift[], employees: Employee[]) => {
    if (loadedSchedules[selectedBranchId]) {
      return // Already loaded
    }
    let schedulesInCurrentBranch = schedules || [];

    if (!schedules) {
      const shiftsInCurrentBranch = shifts.filter(s => s.branchId === branchId) || [];
      schedulesInCurrentBranch = weekDays.reduce((list: Schedule[], weekDay) => {
        const items = shiftsInCurrentBranch.map((s) => ({
          id: 0,
          name: s.name,
          abbreviation: s.abbreviation,
          maxSlots: s.maxSlots,
          status: "draft",
          branchId: s.branchId,
          startTime: s.startTime,
          endTime: s.endTime,
          note: s.note || '',
          shiftId: s.id,
          workDate: weekDay.date,
        } as Schedule))
        return list.concat(items)
      }, [])
    }
    const scheduleInWeek = Object.fromEntries(
      schedulesInCurrentBranch.map((schedule) => {
        const key = getScheduleKey(schedule.shiftId, schedule.workDate);
        const currentShift = shifts.find(s => s.id === schedule.shiftId);
        const rostersBySchedule = rosters!.filter((roster) => roster.scheduleId == schedule.id);
        const assignments = rostersBySchedule.map((roster) => ({
          rosterId: roster.id,
          scheduleId: roster.scheduleId,
          employeeId: roster.employeeId,
          startTime: getTime(roster.actualStartAt),
          endTime: getTime(roster.actualEndAt),
        } as EmployeeAssignment));
        return [
          key,
          {
            scheduleId: schedule.id,
            shiftId: schedule.shiftId,
            date: schedule.workDate,
            assignedEmployees: rostersBySchedule.map((roster) => roster.employeeId),
            startTime: getTime(schedule.startTime),
            endTime: getTime(schedule.endTime),
            maxSlots: schedule.maxSlots,
            assignments: assignments,
            isDirty: false,
            isSaving: false,
            color: currentShift?.color
          } as ScheduleSlot
        ];
    }));

    setLoadedSchedules((prev) => ({
      ...prev,
      [branchId]: scheduleInWeek
    }));
    setEmployeesByBranch(employees.filter((emp) => emp.branchIds.includes(branchId)));
    setShiftsByBranch(shifts.filter((shf) => shf.branchId === branchId));
  }

  if (isFetchingBranches || isFetchingShifts || isFetchingEmployees) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Schedule Shifts</h2>
        <div className="text-center py-8 text-muted-foreground">Loading branches...</div>
      </div>
    )
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
          <AccordionItem key={branch.id} value={branch.id.toString()} className="border border-border rounded-lg">
            <AccordionTrigger
              onClick={() => {
                // loadBranchSchedule(branch.id)
                setSelectedBranchId(branch.id)
              }}
              className="px-6 py-4 hover:bg-muted/50 data-[state=open]:bg-muted/30"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{branch.name}</h3>
                  <p className="text-sm text-muted-foreground">{branch.abbreviation}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4 border-t border-border">
              {loadedSchedules[branch.id] ? (
                <BranchScheduleTable
                  branchId={branch.id}
                  branchName={branch.name}
                  employees={employeesByBranch}
                  shifts={shiftsByBranch}
                  initialSchedule={loadedSchedules[branch.id]}
                  weekDays={weekDays}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
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
            <span className="text-sm font-medium text-foreground">Total Branches</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{branches!.length}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Total Employees</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{sampleEmployees.length}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Shift Templates</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{sampleShifts.length}</span>
        </div>
      </div>
    </div>
  )
}
