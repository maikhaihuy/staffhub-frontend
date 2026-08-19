import { z } from "zod";

export const SHIFT_STATUS = ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] as const;

/**
 * Fields editable via the create/update form - matches the real backend's
 * CreateMasterShiftTemplateDto/UpdateMasterShiftTemplateDto.
 */
export const masterShiftTemplateFormSchema = z.object({
  branchId: z.number(),
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  status: z.enum(SHIFT_STATUS).optional(),
  note: z.string().optional(),
});

export const createMasterShiftTemplateSchema = masterShiftTemplateFormSchema;

export const updateMasterShiftTemplateSchema = masterShiftTemplateFormSchema.partial();

/**
 * Full entity as returned by the backend - includes nested
 * subShiftTemplates/taskTemplates (empty arrays until those features exist).
 */
export const masterShiftTemplateSchema = masterShiftTemplateFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  branch: z
    .object({ id: z.number(), name: z.string(), abbreviation: z.string() })
    .optional(),
  subShiftTemplates: z.array(z.unknown()).optional(),
  taskTemplates: z.array(z.unknown()).optional(),
});
