'use client';

import { Employee } from "@/features/employee/types";
import { Shift } from "@/features/shift/types";
import { ScheduledShift } from "@/features/scheduledShift/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Download, FileText, Users } from "lucide-react";

// Sample employees
const sampleEmployees: Employee[] = [
  { id: 1, name: "Sarah Johnson", phone: "123-456-7890", branchIds: [1, 2] },
  { id: 2, name: "Mike Chen", phone: "987-654-3210", branchIds: [1, 3] },
  { id: 3, name: "Emily Davis", phone: "555-555-5555", branchIds: [2, 3] },
  { id: 4, name: "James Wilson", phone: "111-222-3333", branchIds: [1, 2, 3] },
  { id: 5, name: "Lisa Rodriguez", phone: "444-555-6666", branchIds: [2, 3] },
  { id: 6, name: "David Kim", phone: "123-456-7890", branchIds: [1, 2] },
  { id: 7, name: "Anna Martinez", phone: "987-654-3210", branchIds: [1, 3] },
]

// Sample shifts with colors
const sampleShifts: Shift[] = [
  { id: "morning", name: "Morning Shift", startTime: "06:00", endTime: "14:00", color: "bg-blue-500" },
  { id: "afternoon", name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", color: "bg-green-500" },
  { id: "night", name: "Night Shift", startTime: "22:00", endTime: "06:00", color: "bg-purple-500" },
]

// Days of the week
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const dayAbbr = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Sample scheduled shifts
const sampleScheduledShifts: ScheduledShift[] = [
  { shiftId: "morning", day: "Monday", assignedEmployees: [1, 2, 4] },
  { shiftId: "afternoon", day: "Monday", assignedEmployees: [3, 5, 6, 7] },
  { shiftId: "night", day: "Monday", assignedEmployees: [2, 5] },
  { shiftId: "morning", day: "Tuesday", assignedEmployees: [1, 3, 4] },
  { shiftId: "afternoon", day: "Tuesday", assignedEmployees: [2, 5, 6] },
  { shiftId: "morning", day: "Wednesday", assignedEmployees: [1, 2] },
  { shiftId: "afternoon", day: "Wednesday", assignedEmployees: [3, 4, 5, 7] },
  { shiftId: "night", day: "Wednesday", assignedEmployees: [6, 7] },
  { shiftId: "morning", day: "Thursday", assignedEmployees: [1, 3, 5] },
  { shiftId: "afternoon", day: "Thursday", assignedEmployees: [2, 4, 6, 7] },
  { shiftId: "morning", day: "Friday", assignedEmployees: [1, 2, 3, 4] },
  { shiftId: "afternoon", day: "Friday", assignedEmployees: [5, 6, 7] },
  { shiftId: "night", day: "Friday", assignedEmployees: [2, 3] },
  { shiftId: "morning", day: "Saturday", assignedEmployees: [1, 4, 5] },
  { shiftId: "afternoon", day: "Saturday", assignedEmployees: [2, 3, 6, 7] },
  { shiftId: "morning", day: "Sunday", assignedEmployees: [1, 3] },
  { shiftId: "afternoon", day: "Sunday", assignedEmployees: [2, 4, 5] },
]

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
