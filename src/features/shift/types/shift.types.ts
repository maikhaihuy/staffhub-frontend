import { z } from "zod";
import { shiftSchema, createShiftSchema, updateShiftSchema } from "../schemas/shift.schema";

export type Shift = z.infer<typeof shiftSchema>;
export type CreateShift = z.infer<typeof createShiftSchema>;
export type UpdateShift = z.infer<typeof updateShiftSchema>;
