import { z } from "zod";
import {
  subShiftSchema,
  subShiftLiteSchema,
  subShiftFormSchema,
  createSubShiftSchema,
  updateSubShiftSchema,
} from "../schemas";

export type SubShift = z.infer<typeof subShiftSchema>;
export type SubShiftLite = z.infer<typeof subShiftLiteSchema>;
export type SubShiftFormValues = z.infer<typeof subShiftFormSchema>;
export type CreateSubShiftDTO = z.infer<typeof createSubShiftSchema>;
export type UpdateSubShiftDTO = z.infer<typeof updateSubShiftSchema>;
export type UpdateSubShiftInput = UpdateSubShiftDTO & { id: number };
