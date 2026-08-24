import { z } from "zod";
import { SHIFT_STATUS } from "../masterShiftTemplate/schemas";

export const SUB_SHIFT_TEMPLATE_TYPE = ["MAIN", "SUPPORT"] as const;

/**
 * Matches the real backend's CreateSubShiftTemplateDto/UpdateSubShiftTemplateDto.
 */
const subShiftTemplateBaseSchema = z.object({
  branchId: z.number(),
  masterShiftTemplateId: z.number(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(SUB_SHIFT_TEMPLATE_TYPE),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxAssignments: z.number().positive().optional(),
  sortOrder: z.number().optional(),
  status: z.enum(SHIFT_STATUS).optional(),
  note: z.string().optional(),
});

// .refine() doesn't compose with .partial() on the same schema, so the
// end-after-start check lives only on the form/create schema; the update
// schema stays a plain partial (a patch may not include both fields).
export const subShiftTemplateFormSchema = subShiftTemplateBaseSchema.refine(
  (data) => !data.startTime || !data.endTime || data.endTime > data.startTime,
  { message: "End time must be after start time", path: ["endTime"] }
);

export const createSubShiftTemplateSchema = subShiftTemplateFormSchema;

export const updateSubShiftTemplateSchema = subShiftTemplateBaseSchema.partial();

/**
 * Full entity as returned by the backend.
 */
export const subShiftTemplateSchema = subShiftTemplateBaseSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
});
