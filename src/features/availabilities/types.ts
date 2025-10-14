export type AvailabilityStatus = {
  available: boolean
  hours?: string
}

export type WeeklyAvailability = {
  [employeeId: number]: {
    [day: string]: AvailabilityStatus
  }
}