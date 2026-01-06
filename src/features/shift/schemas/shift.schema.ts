import z from "zod";

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

export const createShiftSchema = shiftSchema.omit({ id: true });
export const updateShiftSchema = shiftSchema.partial().required({ id: true });
