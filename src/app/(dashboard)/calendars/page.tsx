'use client';

import { Employee } from "@/features/employee/types";
import { Shift } from "@/features/shift/types";
import { sampleSchedules, ScheduledShift } from "@/features/schedules/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Download, FileText, Users } from "lucide-react";

import { sampleShifts } from "@/features/shift/types";
import { sampleEmployees } from "@/features/employee/types";

// Days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const dayAbbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Sample scheduled shifts
const sampleScheduledShifts: ScheduledShift[] = [
  { shiftId: 1, day: "Monday", assignedEmployees: [1, 2, 4] },
  { shiftId: 2, day: "Monday", assignedEmployees: [3, 5, 6, 7] },
  { shiftId: 3, day: "Monday", assignedEmployees: [2, 5] },
  { shiftId: 1, day: "Tuesday", assignedEmployees: [1, 3, 4] },
  { shiftId: 2, day: "Tuesday", assignedEmployees: [2, 5, 6] },
  { shiftId: 1, day: "Wednesday", assignedEmployees: [1, 2] },
  { shiftId: 2, day: "Wednesday", assignedEmployees: [3, 4, 5, 7] },
  { shiftId: 3, day: "Wednesday", assignedEmployees: [6, 7] },
  { shiftId: 1, day: "Thursday", assignedEmployees: [1, 3, 5] },
  { shiftId: 2, day: "Thursday", assignedEmployees: [2, 4, 6, 7] },
  { shiftId: 1, day: "Friday", assignedEmployees: [1, 2, 3, 4] },
  { shiftId: 2, day: "Friday", assignedEmployees: [5, 6, 7] },
  { shiftId: 3, day: "Friday", assignedEmployees: [2, 3] },
  { shiftId: 1, day: "Saturday", assignedEmployees: [1, 4, 5] },
  { shiftId: 2, day: "Saturday", assignedEmployees: [2, 3, 6, 7] },
  { shiftId: 1, day: "Sunday", assignedEmployees: [1, 3] },
  { shiftId: 2, day: "Sunday", assignedEmployees: [2, 4, 5] },
]
const scheduledShifts = sampleSchedules.map((schedule) => ({
  shiftId: schedule.shiftId,
  day: schedule.startTime.toDateString(),
  assignedEmployees: [schedule.employeeId],
}))

export default function CalendarsPage() {
  const [employees] = useState<Employee[]>(sampleEmployees)
  const [shifts] = useState<Shift[]>(sampleShifts)
  const [scheduledShifts] = useState<ScheduledShift[]>(sampleScheduledShifts)

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

  const getShiftsForDay = (day: string) => {
    return scheduledShifts.filter((scheduled) => scheduled.day === day)
  }

  const getShiftColor = (shiftId: string) => {
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
            {daysOfWeek.map((day, index) => (
              <div key={day} className="bg-muted/50 border-b border-l border-border p-4 text-center">
                <div className="text-sm font-medium text-foreground">{day}</div>
                <div className="text-xs text-muted-foreground mt-1">{dayAbbr[index]}</div>
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
                {daysOfWeek.map((day) => {
                  const dayShifts = getShiftsForDay(day)
                  const currentShift = dayShifts.find((s) => s.shiftId === shift.id)

                  return (
                    <div key={`${shift.id}-${day}`} className="border-b border-l border-border p-2 min-h-[80px]">
                      {currentShift && (
                        <div className={`${getShiftColor(shift.id)} rounded-lg p-3 text-white h-full`}>
                          <div className="flex items-center gap-1 mb-2">
                            <Users className="h-3 w-3" />
                            <span className="text-xs font-medium">
                              {currentShift.assignedEmployees.length} employees
                            </span>
                          </div>
                          <div className="space-y-1">
                            {currentShift.assignedEmployees.slice(0, 2).map((empId) => (
                              <div key={empId} className="text-xs bg-white/20 rounded px-2 py-1">
                                {getEmployeeName(empId)}
                              </div>
                            ))}
                            {currentShift.assignedEmployees.length > 2 && (
                              <div className="text-xs text-white/80">
                                +{currentShift.assignedEmployees.length - 2} more
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
          <span className="text-2xl font-bold text-foreground">{scheduledShifts.length}</span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">Total Assignments</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {scheduledShifts.reduce((total, shift) => total + shift.assignedEmployees.length, 0)}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Avg per Shift</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Math.round(
              scheduledShifts.reduce((total, shift) => total + shift.assignedEmployees.length, 0) /
                scheduledShifts.length,
            )}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-foreground">Active Employees</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {new Set(scheduledShifts.flatMap((shift) => shift.assignedEmployees)).size}
          </span>
        </div>
      </div>
    </div>
  );
}
