import z from "zod";
import { SCHEDULE_STATUS } from "@/constants";
import { rosterSchema } from "../../roster/schemas/roster.schema";

export const scheduleSchema = z.object({
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

export const createScheduleSchema = scheduleSchema.omit({ id: true });
export const updateScheduleSchema = scheduleSchema.omit({ id: true });

export const scheduleWithRostersSchema = scheduleSchema.extend({
  rosters: z.array(rosterSchema),
});