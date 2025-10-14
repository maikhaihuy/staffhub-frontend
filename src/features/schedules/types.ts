
export type ScheduleSlot = {
  shiftId: string
  day: string
  assignedEmployees: number[]
}

export type WeeklySchedule = {
  [key: string]: ScheduleSlot
}