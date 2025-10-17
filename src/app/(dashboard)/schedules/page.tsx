'use client';

import { Employee, sampleEmployees } from "@/features/employee/types";
import { sampleSchedules, Schedule, ScheduleSlot, WeeklySchedule } from "@/features/schedule/types";
import { sampleShifts, Shift } from "@/features/shift/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Save, Users, X } from "lucide-react";
import { Roster, sampleRosters } from "@/features/roster/types";

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

export default function SchedulesPage() {
  const branchId = 1;
  const [employees] = useState<Employee[]>(sampleEmployees.filter((emp) => emp.branchIds.includes(branchId)))
  const [shifts] = useState<Shift[]>(sampleShifts.filter((shift) => shift.branchId == branchId))
  const [schedules] = useState<Schedule[]>(sampleSchedules.filter((schedule) => schedule.branchId == branchId));
  const [rosters] = useState<Roster[]>(sampleRosters);
  
  const [scheduleInWeek, setScheduleInWeek] = useState<WeeklySchedule>({});
  const [hasChanges, setHasChanges] = useState(false)

  const weekDays = getWeekDates(new Date());

  useEffect(() => {
    setScheduleInWeek(
      Object.fromEntries(schedules.map((schedule) => {
      const key = schedule.shiftId + "-" + schedule.workDate.toDateString();
      const employeeIds = rosters.filter((roster) => roster.scheduleId == schedule.id).map((roster) => roster.employeeId);
      return [
        key,
        {
          shiftId: schedule.shiftId,
          date: schedule.workDate.toDateString(),
          assignedEmployees: employeeIds,
        } as ScheduleSlot
      ];
    }))
  )
  }, [rosters, schedules]);

  const getScheduleKey = (shiftId: number, day: string) => `${shiftId}-${day}`

  const assignEmployee = (shiftId: number, day: string, employeeId: number) => {
    const key = getScheduleKey(shiftId, day)
    setScheduleInWeek((prev) => {
      const currentSlot = prev[key] || { shiftId, date: day, assignedEmployees: [] }
      const isAssigned = currentSlot.assignedEmployees.includes(employeeId)

      return {
        ...prev,
        [key]: {
          ...currentSlot,
          assignedEmployees: isAssigned
            ? currentSlot.assignedEmployees.filter((id) => id !== employeeId)
            : [...currentSlot.assignedEmployees, employeeId],
        },
      }
    })
    setHasChanges(true)
  }

  const removeEmployee = (shiftId: number, day: string, employeeId: number) => {
    const key = getScheduleKey(shiftId, day)
    setScheduleInWeek((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        assignedEmployees: prev[key]?.assignedEmployees.filter((id) => id !== employeeId) || [],
      },
    }))
    setHasChanges(true)
  }

  const saveSchedule = () => {
    // Here you would typically save to a backend
    console.log("Saving schedule:", scheduleInWeek)
    setHasChanges(false)
    // Show success message
  }

  const getShiftCell = (shift: Shift, day: string) => {
    const key = getScheduleKey(shift.id, day)
    const slot = scheduleInWeek[key]
    const assignedEmployees = slot?.assignedEmployees || []
    const isFullyStaffed = assignedEmployees.length >= shift.maxSlots
    const availableEmployees = employees.filter((emp) => !assignedEmployees.includes(emp.id))

    return (
      <td key={key} className="p-2 border-r border-border last:border-r-0 align-top">
        <div className="space-y-2">
          {/* Assigned employees */}
          <div className="space-y-1">
            {assignedEmployees.map((empId) => {
              const employee = employees.find((e) => e.id === empId)
              if (!employee) return null

              return (
                <div
                  key={empId}
                  className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs"
                >
                  <span className="font-medium text-blue-900">{employee.name}</span>
                  <button
                    onClick={() => removeEmployee(shift.id, day, empId)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add employee dropdown */}
          {availableEmployees.length > 0 && (
            <select
              className="w-full text-xs border border-border rounded px-2 py-1 bg-background"
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  assignEmployee(shift.id, day, Number.parseInt(e.target.value))
                }
              }}
            >
              <option value="">+ Add Employee</option>
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.phone})
                </option>
              ))}
            </select>
          )}

          {/* Staffing indicator */}
          <div className="text-xs text-center">
            <span className={`font-medium ${isFullyStaffed ? "text-green-600" : "text-orange-600"}`}>
              {assignedEmployees.length}/{shift.maxSlots}
            </span>
          </div>
        </div>
      </td>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Schedule Shifts</h2>
        <Button onClick={saveSchedule} disabled={!hasChanges} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Schedule
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Fully Staffed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
          <span>Understaffed</span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground min-w-[200px]">Shift</th>
                {weekDays.map(({day, date}) => (
                  <th
                    key={day}
                    className="px-4 py-4 text-center text-sm font-medium text-muted-foreground min-w-[180px]"
                  >
                    {day}
                    {date.toDateString()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 border-r border-border">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{shift.name}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Needs {shift.maxSlots} employees</span>
                      </div>
                    </div>
                  </td>
                  {weekDays.map(({date}) => getShiftCell(shift, date.toDateString()))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-foreground">Total Shifts</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{shifts.length * 7}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Scheduled Employees</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Object.values(scheduleInWeek).reduce((total, slot) => total + slot.assignedEmployees.length, 0)}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Coverage Rate</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Math.round(
              (Object.values(scheduleInWeek).filter((slot) => {
                const shift = shifts.find((s) => s.id === slot.shiftId)
                return shift && slot.assignedEmployees.length >= shift.maxSlots
              }).length /
                (shifts.length * 7)) *
                100,
            )}
            %
          </span>
        </div>
      </div>
    </div>
  )
}
