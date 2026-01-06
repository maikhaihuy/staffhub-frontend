import { z } from "zod";
import { ROSTER_MODE, ROSTER_STATUS } from "@/constants";

export const rosterSchema = z.object({
  id: z.number(),
  scheduleId: z.number(),
  employeeId: z.number(),
  assignedAt: z.date().optional(),
  actualDate: z.date(),
  actualStartAt: z.date(),
  actualEndAt: z.date(),
  status: z.enum(Object.values(ROSTER_STATUS) as [string, ...string[]]),
  mode: z.enum(Object.values(ROSTER_MODE) as [string, ...string[]]),
  note: z.string(),
});

export const createRosterSchema = rosterSchema.omit({ id: true });

export const updateRosterSchema = rosterSchema.partial().required({ id: true });
