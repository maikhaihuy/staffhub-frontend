"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { EmployeeWithAvailabilities } from "@/features/employee/types"
import { Schedule, ScheduleSlot } from "@/features/schedule/types"
import { SchduleTimeDialog } from "./scheduleSlot/schedule-time-dialog"
import { ScheduleInfoHeader } from "./scheduleSlot/schedule-info-header"
import { AssignmentList } from "./employeeAssignment/assignment-list"
import { combineDateTime, getTime, getTimeFromString } from "@/utils/dateTimeHelpers"
import { ScheduleStatusButton } from "./scheduleSlot/shedule-status-button"
import { useMutation } from "@tanstack/react-query"
import { publish, update } from "@/features/schedule/api"
import { EmployeeAssignment } from "@/features/roster/types"

interface ScheduleSlotCellProps {
  slot: ScheduleSlot
  employees: EmployeeWithAvailabilities[]
  // eslint-disable-next-line no-unused-vars
  onUpdate: (_updates: Partial<ScheduleSlot>) => void
}

export function ScheduleSlotCell({ slot, employees, onUpdate }: ScheduleSlotCellProps) {
  const [isEditingTimes, setIsEditingTimes] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false);

  const {mutate: publishMutate, isPending: isPublishing } = useMutation({
    mutationFn: (scheduleId: number) => publish(scheduleId),
    onSuccess: async (data) => {
      console.log("I'm first!")
      const newAssignments = data.rosters.map((roster) => ({
        rosterId: roster.id,
        scheduleId: roster.scheduleId,
        employeeId: roster.employeeId,
        startTime: getTime(roster.actualStartAt),
        endTime: getTime(roster.actualEndAt),
        status: roster.status,
        mode: roster.mode,
      } as EmployeeAssignment));

      onUpdate({
        status: data.status,
        assignments: newAssignments,
      } as Partial<ScheduleSlot>);
    },
  });

  const {mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (schedule: Schedule) => update(schedule.id, schedule),
    onSuccess: async (data) => {
      console.log('dialog update ', data);
      onUpdate({
        startTime: getTime(data.startTime),
        endTime: getTime(data.endTime),
        maxSlots: data.maxSlots,
      } as Partial<ScheduleSlot>)
      setIsEditingTimes(false)
    },
  });

  useEffect(() => {
    setIsLoading(isUpdating || isPublishing);
  }, [isUpdating, isPublishing]);

  const handleSaveSchedule = (startTime: string, endTime: string, maxSlots: number) => {
    const editStartTime = combineDateTime(slot.date, getTimeFromString(startTime));
    const editEndTime = combineDateTime(slot.date, getTimeFromString(endTime));
    if (editStartTime >= editEndTime) {
      toast.error("Start time must be before end time")
      return
    }

    updateMutate({
      id: slot.scheduleId,
      startTime: editStartTime,
      endTime: editEndTime,
      maxSlots: maxSlots,
    } as Schedule)
  }

  const handlePublishSchedule = () => {
    publishMutate(slot.scheduleId);
  }

  return (
    <>
      <td
        className={`p-3 border-r border-border last:border-r-0 align-top min-w-[250px] ${
          isLoading ? "bg-yellow-50 " : ""
        }`}
      >
        <div className="space-y-3">
          {/* Slot times and max slots - editable */}
          <ScheduleInfoHeader slot={slot} isSaving={isLoading} onOpenChange={setIsEditingTimes}/>
          
          {/* Assign employee to schedule slot */}
          <AssignmentList
            isSaving={isLoading}
            slot={slot}
            employees={employees}
            onUpdate={onUpdate}
          />

          {/* Pub/Unpub button */}
          <ScheduleStatusButton isSaving={isLoading} status={slot.status} onClick={handlePublishSchedule} />

        </div>
      </td>

      {/* Edit slot times modal */}
      <SchduleTimeDialog isSaving={isUpdating} startTime={slot.startTime} endTime={slot.endTime} maxSlots={slot.maxSlots} isOpen={isEditingTimes} onOpenChange={setIsEditingTimes}
        onSave={({startTime, endTime, maxSlots}) => handleSaveSchedule(startTime, endTime, maxSlots)}
        onCancel={() => setIsEditingTimes(false)}
      />
    </>
  )
}
