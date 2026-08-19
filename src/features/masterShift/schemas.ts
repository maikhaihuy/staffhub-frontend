import { z } from "zod";
import { SHIFT_STATUS } from "../masterShiftTemplate/schemas";
import { subShiftLiteSchema } from "../subShift/schemas";

export { SHIFT_STATUS };

/**
 * Fields editable via the create/update form - matches the real backend's
 * CreateMasterShiftDto/UpdateMasterShiftDto.
 */
export const masterShiftFormSchema = z.object({
  branchId: z.number(),
  masterShiftTemplateId: z.number().optional(),
  workDate: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(SHIFT_STATUS).optional(),
  note: z.string().optional(),
});

export const createMasterShiftSchema = masterShiftFormSchema;

export const updateMasterShiftSchema = masterShiftFormSchema.partial();

/**
 * Full entity as returned by the backend - includes nested subShifts/tasks.
 */
export const masterShiftSchema = masterShiftFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  branch: z
    .object({ id: z.number(), name: z.string(), abbreviation: z.string() })
    .optional(),
  masterShiftTemplate: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  subShifts: z.array(subShiftLiteSchema).optional(),
  tasks: z.array(z.unknown()).optional(),
});
