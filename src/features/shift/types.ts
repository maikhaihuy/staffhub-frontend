import { z } from "zod";

export type Shift = z.infer<typeof shiftSchema>;

export const shiftSchema = z.object({
  id: z.string(), // for update, not required on create
  name: z.string().min(1, "Name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  color: z.string().min(1, "Color is required"),
  requiredEmployees: z.number().optional(),
});