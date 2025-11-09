import { ROSTER_MODE, ROSTER_STATUS } from "@/constants"

export type EmployeeAssignment = {
  rosterId: number
  scheduleId: number
  employeeId: number
  employeeName: string
  startTime: string
  endTime: string
  status: (typeof ROSTER_STATUS)[keyof typeof ROSTER_STATUS]
  mode: (typeof ROSTER_MODE)[keyof typeof ROSTER_MODE]
}
