'use client';

import { Employee } from "@/features/employee/types";
import { Shift } from "@/features/shift/types";
import { sampleSchedules, Schedule, ScheduleSlot, WeeklySchedule } from "@/features/schedule/types";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Download, FileText, Users } from "lucide-react";

import { sampleShifts } from "@/features/shift/types";
import { sampleEmployees } from "@/features/employee/types";
import { Roster, sampleRosters } from "@/features/roster/types";
import { useState } from "react";

function getWeekDates(date: Date): {day: string, date: Date }[] {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // get first day (Sunday) of the week
  const start = new Date(date);
  const day = start.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1 - day); // if Sunday, go back 6 days; else go back to Monday
  start.setDate(start.getDate() + diff); // move to Sunday

  // build full week
  const week = daysOfWeek.map((dayName, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      day: dayName,
      date: d,
    };
  });

  return week;
}

export default function CalendarsPage() {
  const branchId = 1;
  
  const getScheduleKey = (shiftId: number, day: string) => `${shiftId}-${day}`;
  
  const [employees] = useState<Employee[]>(sampleEmployees.filter((emp) => emp.branchIds.includes(branchId)))
  const [shifts] = useState<Shift[]>(sampleShifts.filter((shift) => shift.branchId == branchId))
  const [schedules] = useState<Schedule[]>(sampleSchedules.filter((schedule) => schedule.branchId == branchId));
  const [rosters] = useState<Roster[]>(sampleRosters);

  const weekDays = getWeekDates(new Date());
  const scheduleInWeek: WeeklySchedule = Object.fromEntries(schedules.map((schedule) => {
      const key = getScheduleKey(schedule.shiftId, schedule.workDate.toDateString());
      const employeeIds = rosters.filter((roster) => roster.scheduleId == schedule.id).map((roster) => roster.employeeId);
      return [
        key,
        {
          shiftId: schedule.shiftId,
          date: schedule.workDate.toDateString(),
          assignedEmployees: employeeIds,
        } as ScheduleSlot
      ];
    }));

  const exportToExcel = () => {
    // Here you would implement Excel export functionality
    console.log("Exporting to Excel...")
    // Show success message
  }

  const exportToPDF = () => {
    // Here you would implement PDF export functionality
    console.log("Exporting to PDF...")
    // Show success message
  }

  // const getSchedulesForDay = (date: Date) => {
  //   return schedules.filter((scheduled) => scheduled.workDate === date)
  // }

  const getShiftColor = (shiftId: number) => {
    const shift = shifts.find((s) => s.id === shiftId)
    return shift?.color || "bg-gray-500"
  }

  // const getShiftInfo = (shiftId: string) => {
  //   return shifts.find((s) => s.id === shiftId)
  // }

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find((e) => e.id === employeeId)
    return employee?.name || "Unknown"
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Shift Calendar</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToExcel} className="flex items-center gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Export to Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="flex items-center gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <span className="font-medium text-foreground">Shift Types:</span>
        {shifts.map((shift) => (
          <div key={shift.id} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${shift.color} rounded`}></div>
            <span className="text-muted-foreground">
              {shift.name} ({shift.startTime} - {shift.endTime})
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
              <span className="text-sm font-medium text-muted-foreground">Time</span>
            </div>
            {weekDays.map(({day, date}) => (
              <div key={day} className="bg-muted/50 border-b border-l border-border p-4 text-center">
                <div className="text-sm font-medium text-foreground">{day}</div>
                <div className="text-xs text-muted-foreground mt-1">{date.toDateString()}</div>
              </div>
            ))}

            {/* Time slots and shifts */}
            {shifts.map((shift) => (
              <div key={shift.id} className="contents">
                {/* Time slot label */}
                <div className="border-b border-border p-4 bg-muted/20">
                  <div className="text-sm font-medium text-foreground">{shift.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {shift.startTime} - {shift.endTime}
                  </div>
                </div>

                {/* Daily shift blocks */}
                {weekDays.map(({day, date}) => {
                  // const dayShifts = getSchedulesForDay(date)
                  // const currentShift = dayShifts.find((s) => s.shiftId === shift.id)
                  const currentSchedule = schedules.find((s) => s.shiftId === shift.id && s.workDate.toDateString() === date.toDateString())
                  
                  const key = getScheduleKey(shift.id, date.toDateString());
                  const currentRoster = scheduleInWeek[key];

                  return (
                    <div key={`${shift.id}-${day}`} className="border-b border-l border-border p-2 min-h-[80px]">
                      {currentSchedule && (
                        <div className={`${getShiftColor(shift.id)} rounded-lg p-3 text-white h-full`}>
                          <div className="flex items-center gap-1 mb-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {currentSchedule.maxSlots} employees
                            </span>
                          </div>
                          <div className="space-y-1">
                            {currentRoster && currentRoster.assignedEmployees && currentRoster.assignedEmployees.slice(0, 2).map((empId) => (
                              <div key={empId} className="text-xs bg-white/20 rounded px-2 py-1">
                                {getEmployeeName(empId)}
                              </div>
                            ))}
                            {currentRoster && currentRoster.assignedEmployees && currentRoster.assignedEmployees.length > 2 && (
                              <div className="text-xs text-white/80">
                                +{currentRoster.assignedEmployees.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
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
            <span className="text-sm font-medium text-foreground">Total Shifts</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{Object.values(scheduleInWeek).length}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Total Assignments</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Object.values(scheduleInWeek).reduce((total, shift) => total + shift.assignedEmployees.length, 0)}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Avg per Shift</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Math.round(
              Object.values(scheduleInWeek).reduce((total, shift) => total + shift.assignedEmployees.length, 0) /
                Object.values(scheduleInWeek).length,
            )}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-foreground">Active Employees</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {new Set(Object.values(scheduleInWeek).flatMap((shift) => shift.assignedEmployees)).size}
          </span>
        </div>
      </div>
    </div>
  );
}
