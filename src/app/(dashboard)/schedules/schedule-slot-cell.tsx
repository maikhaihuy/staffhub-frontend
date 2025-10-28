"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Employee } from "@/features/employee/types"
import { ScheduleSlot } from "@/features/schedule/types"
import { EmployeeTimeDialog } from "./employeeAssignment/employee-time-dialog"
import { SchduleTimeDialog } from "./scheduleSlot/schedule-time-dialog"
import { ScheduleInfoHeader } from "./scheduleSlot/schedule-info-header"
import { AssignmentList } from "./employeeAssignment/assignment-list"
import { TimeRange } from "@/utils/dateTimeHelpers"

interface ScheduleSlotCellProps {
  slot: ScheduleSlot
  employees: Employee[]
  // eslint-disable-next-line no-unused-vars
  onUpdate: (_updates: Partial<ScheduleSlot>) => void
  onSave: () => void
}

export function ScheduleSlotCell({ slot, employees, onUpdate, onSave }: ScheduleSlotCellProps) {
  const [isEditingTimes, setIsEditingTimes] = useState<boolean>(false)
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [isEditingEmployeeTime, setIsEditingEmployeeTime] = useState<boolean>(false)
  const [selectedAssignmentTimeRange, setSelectedAssignmentTimeRange] = useState<TimeRange>({startTime: slot.startTime, endTime: slot.endTime});
  
  const handleAddAssignment = (employeeId: number) => {
    const newAssignments = [
      ...slot.assignments,
      {
        employeeId,
        rosterId: 0,
        scheduleId: slot.scheduleId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    ]
    onUpdate({ assignments: newAssignments, isDirty: true })
  }

  const handleRemoveAssignment = (employeeId: number) => {
    const newAssignments = slot.assignments.filter((a) => a.employeeId !== employeeId)
    onUpdate({ assignments: newAssignments, isDirty: true })
  }

  const handleEditAssignment = (employeeId: number) => {
    const assignment = slot.assignments.find((a) => a.employeeId === employeeId)
    setSelectedEmployeeId(employeeId)
    setSelectedAssignmentTimeRange({startTime: assignment?.startTime || slot.startTime, endTime: assignment?.endTime || slot.endTime} as TimeRange);
    setIsEditingEmployeeTime(true)
  }

  const handleSaveEmployeeTime = (startTime: string, endTime: string) => {
    if (!selectedEmployeeId) return

    const newAssignments = slot.assignments.map((a) =>
      a.employeeId === selectedEmployeeId ? { ...a, startTime, endTime } : a,
    )
    
    onUpdate({ assignments: newAssignments, isDirty: true })
    setIsEditingEmployeeTime(false)
    setSelectedEmployeeId(null)
  }

  const handleSaveSlotTimes = (startTime: string, endTime: string, maxSlots: number) => {
    if (startTime >= endTime) {
      toast.error("Start time must be before end time")
      return
    }

    onUpdate({
      startTime,
      endTime,
      maxSlots,
      isDirty: true,
    })
    setIsEditingTimes(false)
  }

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)

  return (
    <>
      <td
        className={`p-3 border-r border-border last:border-r-0 align-top min-w-[250px] ${
          slot.isDirty ? "bg-yellow-50 border-l-4 border-l-yellow-400" : ""
        }`}
      >
        <div className="space-y-3">
          {/* Slot times and max slots - editable */}
          <ScheduleInfoHeader isSaving={slot.isSaving} startTime={slot.startTime} endTime={slot.endTime} maxSlots={slot.maxSlots} onOpenChange={setIsEditingTimes}/>
          
          {/* Assign employee to schedule slot */}
          <AssignmentList
            slot={slot}
            employees={employees}
            onClickAddAssignment={handleAddAssignment}
            onClickEditAssignment={handleEditAssignment}
            onClickRemoveAssignment={handleRemoveAssignment}
          />

          {/* Save button - enabled only when dirty */}
          <Button
            onClick={onSave}
            disabled={!slot.isDirty || slot.isSaving}
            size="sm"
            className="w-full text-xs"
            variant={slot.isDirty ? "default" : "outline"}
          >
            {slot.isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </td>

      {/* Edit slot times modal */}
      <SchduleTimeDialog startTime={slot.startTime} endTime={slot.endTime} maxSlots={slot.maxSlots} isOpen={isEditingTimes} onOpenChange={setIsEditingTimes}
        onSave={({startTime, endTime, maxSlots}) => handleSaveSlotTimes(startTime, endTime, maxSlots)}
        onCancel={() => setIsEditingTimes(false)}
      />

      {/* Edit employee time ranges modal */}
      <EmployeeTimeDialog
        nameEmployee={selectedEmployee?.name || ''}
        timeRange={selectedAssignmentTimeRange}
        isOpen={isEditingEmployeeTime}
        onOpenChange={setIsEditingEmployeeTime}
        onCancel={() => setIsEditingEmployeeTime(false)}
        onSave={({startTime, endTime}) => {
          console.log('startTime-endTime', startTime, endTime);
          handleSaveEmployeeTime(startTime, endTime)
          }
        }
      />
    </>
  )
}
