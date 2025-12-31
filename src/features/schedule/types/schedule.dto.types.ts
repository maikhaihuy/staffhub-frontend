import { EmployeeAssignment } from "@/features/roster/types/roster.dto.types"
import { Schedule } from "./schedule.types"
import { SCHEDULE_STATUS } from "@/constants"

export type ScheduleSlot = {
  scheduleId: number
  shiftId: number
  date: Date
  startTime: string
  endTime: string
  maxSlots: number
  assignments: EmployeeAssignment[]
  status: (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS],
  color: string
}

export type WeeklySchedule = {
  [key: string]: ScheduleSlot
}

export type ScheduleGroup = {
  name: string;
  timeRange: string;
  schedules: Schedule[];
}