import { z } from "zod";

export type ScheduleSlot = {
  shiftId: string
  day: string
  assignedEmployees: number[]
}

export type WeeklySchedule = {
  [key: string]: ScheduleSlot
}

export type ScheduledShift =z.infer<typeof scheduledShiftSchema>;

export const scheduledShiftSchema = z.object({
  shiftId: z.number(),
  day: z.string(),
  assignedEmployees: z.array(z.number()),
});

export const schedulesSchema = z.object({
  id: z.number(),
  shiftId: z.number(),
  employeeId: z.number(),
  branchId: z.number(),
  startTime: z.date(),
  endTime: z.date(),
  note: z.string(),
});

export type Schedule = z.infer<typeof schedulesSchema>;

const sampleDate = new Date();
export const sampleSchedules: Schedule[] = [
  { id: 1, shiftId: 1, employeeId: 1, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 2, shiftId: 2, employeeId: 2, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 3, shiftId: 3, employeeId: 3, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 4, shiftId: 1, employeeId: 4, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 5, shiftId: 2, employeeId: 5, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 6, shiftId: 3, employeeId: 6, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 7, shiftId: 1, employeeId: 7, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 8, shiftId: 2, employeeId: 1, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 9, shiftId: 3, employeeId: 2, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 10, shiftId: 1, employeeId: 3, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 11, shiftId: 2, employeeId: 4, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 12, shiftId: 3, employeeId: 5, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 13, shiftId: 1, employeeId: 6, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 14, shiftId: 2, employeeId: 7, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
  { id: 15, shiftId: 3, employeeId: 1, branchId: 1, startTime: sampleDate, endTime: new Date(sampleDate.getTime() + 5*60*60000), note: "" },
]
