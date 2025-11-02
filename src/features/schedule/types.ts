import { SCHEDULE_STATUS } from "@/constants";
import { z } from "zod";
import { EmployeeAssignment, Roster, sampleRosters } from "../roster/types";

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

export const schedulesSchema = z.object({
  id: z.number(),
  shiftId: z.number(),
  branchId: z.number(),
  name: z.string(),
  abbreviation: z.string(),
  maxSlots: z.number(),
  workDate: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.enum(Object.values(SCHEDULE_STATUS) as [string, ...string[]]),
  note: z.string(),
});



export type Schedule = z.infer<typeof schedulesSchema>;

export type ScheduleWithRosters = Schedule & {
  rosters: Roster[]
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

export const sampleSchedules: Schedule[] = [
  { id: 1, shiftId: 1, branchId: 1, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, workDate: sampleMondayDate, startTime: morningShiftStartTime, endTime: morningShiftEndTime, status: SCHEDULE_STATUS.PUBLISHED, note: "" },
  { id: 2, shiftId: 2, branchId: 1, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, workDate: sampleMondayDate, startTime: noonShiftStartTime, endTime: noonShiftEndTime, status: SCHEDULE_STATUS.LOCKED, note: "" },
  { id: 3, shiftId: 3, branchId: 1, name: "Night Shift", abbreviation: "night", maxSlots: 2, workDate: sampleMondayDate, startTime: nightShiftStartTime, endTime: nightShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 4, shiftId: 1, branchId: 1, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, workDate: sampleTuesdayDate, startTime: morningShiftStartTime, endTime: morningShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 5, shiftId: 2, branchId: 1, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, workDate: sampleTuesdayDate, startTime: noonShiftStartTime, endTime: noonShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 6, shiftId: 3, branchId: 1, name: "Night Shift", abbreviation: "night", maxSlots: 2, workDate: sampleTuesdayDate, startTime: nightShiftStartTime, endTime: nightShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 7, shiftId: 1, branchId: 1, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, workDate: sampleWednesdayDate, startTime: morningShiftStartTime, endTime: morningShiftEndTime, status: SCHEDULE_STATUS.PUBLISHED, note: "" },
  { id: 8, shiftId: 2, branchId: 1, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, workDate: sampleWednesdayDate, startTime: noonShiftStartTime, endTime: noonShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 9, shiftId: 3, branchId: 1, name: "Night Shift", abbreviation: "night", maxSlots: 2, workDate: sampleWednesdayDate, startTime: nightShiftStartTime, endTime: nightShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 10, shiftId: 1, branchId: 1, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, workDate: sampleThursdayDate, startTime: morningShiftStartTime, endTime: morningShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 11, shiftId: 2, branchId: 1, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, workDate: sampleThursdayDate, startTime: noonShiftStartTime, endTime: noonShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 12, shiftId: 3, branchId: 1, name: "Night Shift", abbreviation: "night", maxSlots: 2, workDate: sampleThursdayDate, startTime: nightShiftStartTime, endTime: nightShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 13, shiftId: 1, branchId: 1, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, workDate: sampleFridayDate, startTime: morningShiftStartTime, endTime: morningShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 14, shiftId: 2, branchId: 1, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, workDate: sampleFridayDate, startTime: noonShiftStartTime, endTime: noonShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
  { id: 15, shiftId: 3, branchId: 1, name: "Night Shift", abbreviation: "night", maxSlots: 2, workDate: sampleFridayDate, startTime: nightShiftStartTime, endTime: nightShiftEndTime, status: SCHEDULE_STATUS.DRAFT, note: "" },
]

export const sampleSchedulesWithRosters = (): ScheduleWithRosters[] => sampleSchedules.map(schedule => ({
    ...schedule,
    rosters: sampleRosters.filter(roster => roster.scheduleId === schedule.id)
  }
))