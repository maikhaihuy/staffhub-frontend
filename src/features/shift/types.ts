import { z } from "zod";

export const shiftSchema = z.object({
  id: z.number(),
  branchId: z.number(),
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
  maxSlots: z.number(),
  startTime: z.date(),
  endTime: z.date(),
  color: z.string().min(1, "Color is required"),
  note: z.string().optional(),
});

export type Shift = z.infer<typeof shiftSchema>;
const sampleTime = (time: string) => new Date(`1970-01-01T${time}`);
const morningShiftStartTime = sampleTime("07:00");
const morningShiftEndTime = sampleTime("12:00");
const noonShiftStartTime = sampleTime("12:00");
const noonShiftEndTime = sampleTime("17:00");
const nightShiftStartTime = sampleTime("17:00");
const nightShiftEndTime = sampleTime("22:00");

// Sample shifts with colors
export const sampleShifts: Shift[] = [
  { id: 1, branchId: 1, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, startTime: morningShiftStartTime, endTime: morningShiftEndTime, color: "bg-blue-500" },
  { id: 2, branchId: 1, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, startTime: noonShiftStartTime, endTime: noonShiftEndTime, color: "bg-green-500" },
  { id: 3, branchId: 1, name: "Night Shift", abbreviation: "night", maxSlots: 2, startTime: nightShiftStartTime, endTime: nightShiftEndTime, color: "bg-purple-500" },
  { id: 4, branchId: 2, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, startTime: morningShiftStartTime, endTime: morningShiftEndTime, color: "bg-blue-500" },
  { id: 5, branchId: 2, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, startTime: noonShiftStartTime, endTime: noonShiftEndTime, color: "bg-green-500" },
  { id: 6, branchId: 2, name: "Night Shift", abbreviation: "night", maxSlots: 2, startTime: nightShiftStartTime, endTime: nightShiftEndTime, color: "bg-purple-500" },
  { id: 7, branchId: 3, name: "Morning Shift", abbreviation: "morning", maxSlots: 1, startTime: morningShiftStartTime, endTime: morningShiftEndTime, color: "bg-blue-500" },
  { id: 8, branchId: 3, name: "Afternoon Shift", abbreviation: "afternoon", maxSlots: 3, startTime: noonShiftStartTime, endTime: noonShiftEndTime, color: "bg-green-500" },
  { id: 9, branchId: 3, name: "Night Shift", abbreviation: "night", maxSlots: 2, startTime: nightShiftStartTime, endTime: nightShiftEndTime, color: "bg-purple-500" },
]