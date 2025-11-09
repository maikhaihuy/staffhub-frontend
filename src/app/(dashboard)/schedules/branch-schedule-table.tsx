"use client";

import { ScheduleSlotCell } from "./schedule-slot-cell";
import { SCHEDULE_STATUS } from "@/constants";
import { BranchWithShifts } from "@/features/branch/types";
import { Employee } from "@/features/employee/types";
import { ScheduleSlot, WeeklySchedule } from "@/features/schedule/types";
import { Shift } from "@/features/shift/types";
import { getTime, Weekday } from "@/utils/dateTimeHelpers";
import { getScheduleKey } from "@/utils/scheduleHelpers";
import { Clock, Users } from "lucide-react";
import { useState } from "react";

interface BranchScheduleTableProps {
  branch: BranchWithShifts;
  employees: Employee[];
  initialSchedule: WeeklySchedule;
  weekDays: Weekday[];
}

export function BranchScheduleTable({
  branch,
  employees,
  initialSchedule,
  weekDays,
}: BranchScheduleTableProps) {
  const [scheduleInWeek, setScheduleInWeek] =
    useState<WeeklySchedule>(initialSchedule);

  const updateSlot = (
    shiftId: number,
    date: Date,
    updates: Partial<ScheduleSlot>
  ) => {
    const key = getScheduleKey(shiftId, date);
    setScheduleInWeek((prev) => {
      return {
        ...prev,
        [key]: { ...prev[key], ...updates },
      };
    });
  };

  const getShiftCell = (shift: Shift, date: Date) => {
    const key = getScheduleKey(shift.id, date);
    let scheduleSlot = scheduleInWeek[key];
    if (!scheduleSlot) {
      scheduleSlot = {
        scheduleId: 0,
        shiftId: shift.id,
        date: date,
        startTime: getTime(shift.startTime),
        endTime: getTime(shift.endTime),
        maxSlots: shift.maxSlots,
        assignments: [],
        status: SCHEDULE_STATUS.DRAFT,
        color: shift.color,
      } as ScheduleSlot;
    }
    return (
      <ScheduleSlotCell
        key={key}
        slot={scheduleSlot}
        employees={employees}
        onUpdate={(updates) => updateSlot(shift.id, date, updates)}
      />
    );
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground min-w-[200px]">
              Shift
            </th>
            {weekDays.map(({ dayName, date }) => (
              <th
                key={dayName}
                className="px-4 py-4 text-center text-sm font-medium text-muted-foreground min-w-[250px]"
              >
                {dayName}-{date.toDateString()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {branch.shifts.map((shift) => (
            <tr key={shift.id} className="border-b border-border last:border-0">
              <td className="px-6 py-4 border-r border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {shift.name}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {getTime(shift.startTime)} - {getTime(shift.endTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Max {shift.maxSlots} employees</span>
                  </div>
                </div>
              </td>
              {weekDays.map(({ date }) => getShiftCell(shift, date))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
