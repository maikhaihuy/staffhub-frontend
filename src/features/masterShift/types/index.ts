import { z } from "zod";
import {
  masterShiftSchema,
  masterShiftFormSchema,
  createMasterShiftSchema,
  updateMasterShiftSchema,
} from "../schemas";

export type MasterShift = z.infer<typeof masterShiftSchema>;
export type MasterShiftFormValues = z.infer<typeof masterShiftFormSchema>;
export type CreateMasterShiftDTO = z.infer<typeof createMasterShiftSchema>;
export type UpdateMasterShiftDTO = z.infer<typeof updateMasterShiftSchema>;
export type UpdateMasterShiftInput = UpdateMasterShiftDTO & { id: number };
