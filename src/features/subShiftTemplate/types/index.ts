import { z } from "zod";
import {
  subShiftTemplateSchema,
  subShiftTemplateFormSchema,
  createSubShiftTemplateSchema,
  updateSubShiftTemplateSchema,
} from "../schemas";

export type SubShiftTemplate = z.infer<typeof subShiftTemplateSchema>;
export type SubShiftTemplateFormValues = z.infer<typeof subShiftTemplateFormSchema>;
export type CreateSubShiftTemplateDTO = z.infer<typeof createSubShiftTemplateSchema>;
export type UpdateSubShiftTemplateDTO = z.infer<typeof updateSubShiftTemplateSchema>;
export type UpdateSubShiftTemplateInput = UpdateSubShiftTemplateDTO & { id: number };
