import { z } from "zod";
import {
  masterShiftTemplateSchema,
  masterShiftTemplateFormSchema,
  createMasterShiftTemplateSchema,
  updateMasterShiftTemplateSchema,
} from "../schemas";

export type MasterShiftTemplate = z.infer<typeof masterShiftTemplateSchema>;
export type MasterShiftTemplateFormValues = z.infer<typeof masterShiftTemplateFormSchema>;
export type CreateMasterShiftTemplateDTO = z.infer<typeof createMasterShiftTemplateSchema>;
export type UpdateMasterShiftTemplateDTO = z.infer<typeof updateMasterShiftTemplateSchema>;
export type UpdateMasterShiftTemplateInput = UpdateMasterShiftTemplateDTO & { id: number };
