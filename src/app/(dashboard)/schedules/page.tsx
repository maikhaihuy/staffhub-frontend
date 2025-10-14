'use client';

import { Employee } from "@/features/employee/types";
import { WeeklySchedule } from "@/features/schedules/types";
import { Shift } from "@/features/shift/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Save, Users, X } from "lucide-react";

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

// Sample shifts
const sampleShifts: Shift[] = [
  { id: "morning", name: "Morning Shift", startTime: "06:00", endTime: "14:00", color: "bg-blue-500", requiredEmployees: 3 },
  { id: "afternoon", name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", color: "bg-green-500", requiredEmployees: 4 },
  { id: "night", name: "Night Shift", startTime: "22:00", endTime: "06:00", color: "bg-purple-500", requiredEmployees: 2 },
]

// Days of the week
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// Sample schedule data
const sampleSchedule: WeeklySchedule = {
  "morning-Mon": { shiftId: "morning", day: "Mon", assignedEmployees: [1, 2, 4] },
  "afternoon-Mon": { shiftId: "afternoon", day: "Mon", assignedEmployees: [3, 5, 6, 7] },
  "night-Mon": { shiftId: "night", day: "Mon", assignedEmployees: [2, 5] },
  "morning-Tue": { shiftId: "morning", day: "Tue", assignedEmployees: [1, 3, 4] },
  "afternoon-Tue": { shiftId: "afternoon", day: "Tue", assignedEmployees: [2, 5, 6] },
  "morning-Wed": { shiftId: "morning", day: "Wed", assignedEmployees: [1, 2] },
  "afternoon-Wed": { shiftId: "afternoon", day: "Wed", assignedEmployees: [3, 4, 5, 7] },
}


export default function SchedulesPage() {
  const [employees] = useState<Employee[]>(sampleEmployees)
  const [shifts] = useState<Shift[]>(sampleShifts)
  const [schedule, setSchedule] = useState<WeeklySchedule>(sampleSchedule)
  const [hasChanges, setHasChanges] = useState(false)

  const getScheduleKey = (shiftId: string, day: string) => `${shiftId}-${day}`

  const assignEmployee = (shiftId: string, day: string, employeeId: number) => {
    const key = getScheduleKey(shiftId, day)
    setSchedule((prev) => {
      const currentSlot = prev[key] || { shiftId, day, assignedEmployees: [] }
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

  const removeEmployee = (shiftId: string, day: string, employeeId: number) => {
    const key = getScheduleKey(shiftId, day)
    setSchedule((prev) => ({
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
    console.log("Saving schedule:", schedule)
    setHasChanges(false)
    // Show success message
  }

  const getShiftCell = (shift: Shift, day: string) => {
    const key = getScheduleKey(shift.id, day)
    const slot = schedule[key]
    const assignedEmployees = slot?.assignedEmployees || []
    const isFullyStaffed = assignedEmployees.length >= shift.requiredEmployees!
    const availableEmployees = employees.filter((emp) => !assignedEmployees.includes(emp.id!))

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
              {assignedEmployees.length}/{shift.requiredEmployees}
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
                {daysOfWeek.map((day) => (
                  <th
                    key={day}
                    className="px-4 py-4 text-center text-sm font-medium text-muted-foreground min-w-[180px]"
                  >
                    {day}
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
                        <span>Needs {shift.requiredEmployees} employees</span>
                      </div>
                    </div>
                  </td>
                  {daysOfWeek.map((day) => getShiftCell(shift, day))}
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
            {Object.values(schedule).reduce((total, slot) => total + slot.assignedEmployees.length, 0)}
          </span>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-foreground">Coverage Rate</span>
          </div>
          <span className="text-2xl font-bold text-foreground">
            {Math.round(
              (Object.values(schedule).filter((slot) => {
                const shift = shifts.find((s) => s.id === slot.shiftId)
                return shift && slot.assignedEmployees.length >= shift.requiredEmployees!
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
