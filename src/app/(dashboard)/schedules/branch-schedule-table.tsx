"use client"

import { Clock, Users } from "lucide-react"
import { ScheduleSlotCell } from "./schedule-slot-cell"
import { toast } from "sonner"
import { ScheduleSlot, WeeklySchedule } from "@/features/schedule/types"
import { Employee } from "@/features/employee/types"
import { Shift } from "@/features/shift/types"
import { useState } from "react"
import { getTime, Weekday } from "@/utils/dateTimeHelpers"
import { getScheduleKey } from "@/utils/scheduleHelpers"

interface BranchScheduleTableProps {
  branchId: number
  branchName: string
  employees: Employee[]
  shifts: Shift[]
  initialSchedule: WeeklySchedule
  weekDays: Weekday[]
}

export function BranchScheduleTable({
  branchId,
  employees,
  shifts,
  initialSchedule,
  weekDays,
}: BranchScheduleTableProps) {
  const [scheduleInWeek, setScheduleInWeek] = useState<WeeklySchedule>(initialSchedule);
  const updateSlot = (shiftId: number, date: Date, updates: Partial<ScheduleSlot>) => {
    const key = getScheduleKey(shiftId, date)
    setScheduleInWeek((prev) => {
      const currentShift = shifts.find((s) => s.id === shiftId);
      const {startTime, endTime } = currentShift ? {startTime: getTime(currentShift.startTime), endTime: getTime(currentShift.endTime)} : {startTime: "00:00", endTime: "00:00"};
      const currentSlot = prev[key] || {
        startTime: startTime,
        endTime: endTime,
        maxSlots: currentShift?.maxSlots || 0,
        assignments: [],
        isDirty: false,
        isSaving: false,
      }

      return {
        ...prev,
        [key]: { ...currentSlot, ...updates },
      }
    })
  }

  const saveCellSchedule = async (shiftId: number, date: Date) => {
    const key = getScheduleKey(shiftId, date)
    const slot = scheduleInWeek[key]

    if (!slot) return

    setScheduleInWeek((prev) => ({
      ...prev,
      [key]: { ...prev[key], isSaving: true },
    }))

    try {
      const response = await fetch(`/api/schedule-slots/${branchId}/${shiftId}/${date.toDateString()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxSlots: slot.maxSlots,
          assignments: slot.assignments,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save schedule")
      }

      setScheduleInWeek((prev) => ({
        ...prev,
        [key]: { ...prev[key], isDirty: false, isSaving: false },
      }))

      toast.success(`Schedule saved for ${shiftId} on ${date.toDateString()}`)
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast.error("Failed to save schedule. Please try again.")
      setScheduleInWeek((prev) => ({
        ...prev,
        [key]: { ...prev[key], isSaving: false },
      }))
    }
  }

  const getShiftCell = (shift: Shift, date: Date) => {
    const key = getScheduleKey(shift.id, date)
    const slot = scheduleInWeek[key] || {
      scheduleId: 0,
      shiftId: shift.id,
      date: date,
      startTime: getTime(shift.startTime),
      endTime: getTime(shift.endTime),
      maxSlots: shift.maxSlots,
      assignedEmployees: [],
      assignments: [],
      isDirty: false,
      isSaving: false,
      color: "grey",
    } as ScheduleSlot;
    
    return (
      <ScheduleSlotCell
        key={key}
        slot={slot}
        employees={employees}
        onUpdate={(updates) => updateSlot(shift.id, date, updates)}
        onSave={() => saveCellSchedule(shift.id, date)}
      />
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground min-w-[200px]">Shift</th>
              {weekDays.map(({dayName, date}) => (
                <th key={dayName} className="px-4 py-4 text-center text-sm font-medium text-muted-foreground min-w-[250px]">
                  {dayName}-{date.toDateString()}
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
                        {getTime(shift.startTime)} - {getTime(shift.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Max {shift.maxSlots} employees</span>
                    </div>
                  </div>
                </td>
                {weekDays.map(({date}) => getShiftCell(shift, date))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
