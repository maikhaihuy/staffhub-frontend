import { z } from "zod";

export type ScheduledShift =z.infer<typeof scheduledShiftSchema>;


export const scheduledShiftSchema = z.object({
  shiftId: z.string(),
  day: z.string(),
  assignedEmployees: z.array(z.number()),
});