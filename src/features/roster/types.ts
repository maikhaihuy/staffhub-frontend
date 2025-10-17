import { ROSTER_STATUS } from "@/constants";
import { z } from "zod";

export const rosterSchema = z.object({
  id: z.number(),
  scheduleId: z.number(),
  employeeId: z.number(),
  assignedAt: z.date(),
  actualStartAt: z.date(),
  actualEndAt: z.date(),
  status: z.enum(Object.values(ROSTER_STATUS) as [string, ...string[]]),
  note: z.string(),
});

export type Roster = z.infer<typeof rosterSchema>;

const sampleMondayDate = new Date("2025-10-13");
const sampleTuesdayDate = new Date("2025-10-14");
const sampleWednesdayDate = new Date("2025-10-15");
const sampleThursdayDate = new Date("2025-10-16");
const sampleFridayDate = new Date("2025-10-17");
// const sampleSaturdayDate = new Date("2025-10-18");
// const sampleSundayDate = new Date("2025-10-19");

export const sampleRosters: Roster[] = [
  { id: 1, scheduleId: 1, employeeId: 1, assignedAt: new Date(), actualStartAt: sampleMondayDate, actualEndAt: new Date(sampleMondayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 2, scheduleId: 2, employeeId: 2, assignedAt: new Date(), actualStartAt: sampleMondayDate, actualEndAt: new Date(sampleMondayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 3, scheduleId: 3, employeeId: 3, assignedAt: new Date(), actualStartAt: sampleMondayDate, actualEndAt: new Date(sampleMondayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 4, scheduleId: 4, employeeId: 4, assignedAt: new Date(), actualStartAt: sampleTuesdayDate, actualEndAt: new Date(sampleTuesdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 5, scheduleId: 5, employeeId: 5, assignedAt: new Date(), actualStartAt: sampleTuesdayDate, actualEndAt: new Date(sampleTuesdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 6, scheduleId: 6, employeeId: 6, assignedAt: new Date(), actualStartAt: sampleTuesdayDate, actualEndAt: new Date(sampleTuesdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 7, scheduleId: 7, employeeId: 7, assignedAt: new Date(), actualStartAt: sampleWednesdayDate, actualEndAt: new Date(sampleWednesdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 8, scheduleId: 8, employeeId: 1, assignedAt: new Date(), actualStartAt: sampleWednesdayDate, actualEndAt: new Date(sampleWednesdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 9, scheduleId: 9, employeeId: 2, assignedAt: new Date(), actualStartAt: sampleWednesdayDate, actualEndAt: new Date(sampleWednesdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 10, scheduleId: 10, employeeId: 3, assignedAt: new Date(), actualStartAt: sampleThursdayDate, actualEndAt: new Date(sampleThursdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 11, scheduleId: 11, employeeId: 4, assignedAt: new Date(), actualStartAt: sampleThursdayDate, actualEndAt: new Date(sampleThursdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 12, scheduleId: 12, employeeId: 5, assignedAt: new Date(), actualStartAt: sampleThursdayDate, actualEndAt: new Date(sampleThursdayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 13, scheduleId: 13, employeeId: 6, assignedAt: new Date(), actualStartAt: sampleFridayDate, actualEndAt: new Date(sampleFridayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 14, scheduleId: 14, employeeId: 7, assignedAt: new Date(), actualStartAt: sampleFridayDate, actualEndAt: new Date(sampleFridayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
  { id: 15, scheduleId: 15, employeeId: 1, assignedAt: new Date(), actualStartAt: sampleFridayDate, actualEndAt: new Date(sampleFridayDate.getTime() + 5*60*60000), status: ROSTER_STATUS.ASSIGNED, note: "" },
]
