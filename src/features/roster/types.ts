import { ROSTER_STATUS } from "@/constants";
import { z } from "zod";

export const rosterSchema = z.object({
  id: z.number(),
  scheduleId: z.number(),
  employeeId: z.number(),
  assignedAt: z.date(),
  actualDate: z.date(),
  actualStartAt: z.date(),
  actualEndAt: z.date(),
  status: z.enum(Object.values(ROSTER_STATUS) as [string, ...string[]]),
  note: z.string(),
});

export type Roster = z.infer<typeof rosterSchema>;

export type EmployeeAssignment = {
  rosterId: number
  scheduleId: number
  employeeId: number
  startTime: string
  endTime: string
}

const sampleTime = (time: string) => new Date(`1970-01-01T${time}`);
const morningShiftStartTime = sampleTime("07:00");
const morningShiftEndTime = sampleTime("12:00");
const noonShiftStartTime = sampleTime("12:00");
const noonShiftEndTime = sampleTime("17:00");
const nightShiftStartTime = sampleTime("17:00");
const nightShiftEndTime = sampleTime("22:00");

const sampleMondayDate = new Date("2025-10-13");
const sampleTuesdayDate = new Date("2025-10-14");
const sampleWednesdayDate = new Date("2025-10-15");
const sampleThursdayDate = new Date("2025-10-16");
const sampleFridayDate = new Date("2025-10-17");
// const sampleSaturdayDate = new Date("2025-10-18");
// const sampleSundayDate = new Date("2025-10-19");

export const sampleRosters: Roster[] = [
  { id: 1, scheduleId: 1, employeeId: 1, assignedAt: new Date(), actualDate: sampleMondayDate, actualStartAt: morningShiftStartTime, actualEndAt: morningShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 2, scheduleId: 2, employeeId: 2, assignedAt: new Date(), actualDate: sampleMondayDate, actualStartAt: noonShiftStartTime, actualEndAt: noonShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 3, scheduleId: 3, employeeId: 3, assignedAt: new Date(), actualDate: sampleMondayDate, actualStartAt: nightShiftStartTime, actualEndAt: nightShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 4, scheduleId: 4, employeeId: 4, assignedAt: new Date(), actualDate: sampleTuesdayDate, actualStartAt: morningShiftStartTime, actualEndAt: morningShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 5, scheduleId: 5, employeeId: 5, assignedAt: new Date(), actualDate: sampleTuesdayDate, actualStartAt: noonShiftStartTime, actualEndAt: noonShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 6, scheduleId: 6, employeeId: 6, assignedAt: new Date(), actualDate: sampleTuesdayDate, actualStartAt: nightShiftStartTime, actualEndAt: nightShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 7, scheduleId: 7, employeeId: 7, assignedAt: new Date(), actualDate: sampleWednesdayDate, actualStartAt: morningShiftStartTime, actualEndAt: morningShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 8, scheduleId: 8, employeeId: 1, assignedAt: new Date(), actualDate: sampleWednesdayDate, actualStartAt: noonShiftStartTime, actualEndAt: noonShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 9, scheduleId: 9, employeeId: 2, assignedAt: new Date(), actualDate: sampleWednesdayDate, actualStartAt: nightShiftStartTime, actualEndAt: nightShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 10, scheduleId: 10, employeeId: 3, assignedAt: new Date(), actualDate: sampleThursdayDate, actualStartAt: morningShiftStartTime, actualEndAt: morningShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 11, scheduleId: 11, employeeId: 4, assignedAt: new Date(), actualDate: sampleThursdayDate, actualStartAt: noonShiftStartTime, actualEndAt: noonShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 12, scheduleId: 12, employeeId: 5, assignedAt: new Date(), actualDate: sampleThursdayDate, actualStartAt: nightShiftStartTime, actualEndAt: nightShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 13, scheduleId: 13, employeeId: 6, assignedAt: new Date(), actualDate: sampleFridayDate, actualStartAt: morningShiftStartTime, actualEndAt: morningShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 14, scheduleId: 14, employeeId: 7, assignedAt: new Date(), actualDate: sampleFridayDate, actualStartAt: noonShiftStartTime, actualEndAt: noonShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 15, scheduleId: 15, employeeId: 1, assignedAt: new Date(), actualDate: sampleFridayDate, actualStartAt: nightShiftStartTime, actualEndAt: nightShiftEndTime, status: ROSTER_STATUS.ASSIGNED, note: "" },
]
