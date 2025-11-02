import { z } from "zod";

export type AvailabilityStatus = {
  available: boolean
  hours?: string
}

export type WeeklyAvailability = {
  [employeeId: number]: {
    [day: string]: AvailabilityStatus
  }
}

export type EmployeeAvailabilitiy = {
  availabilityId: number
  employeeId: number
  startTime: string
  endTime: string
}

export const availabilitySchema = z.object({
  employeeId: z.number(),
  startTime: z.date(),
  endTime: z.date(),
});

export type Availability = z.infer<typeof availabilitySchema>;
