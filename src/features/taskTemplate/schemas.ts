import { z } from "zod";

export const TASK_TEMPLATE_TYPE = ["SHARED_MANDATORY", "SHARED_OPTIONAL", "DEDICATED"] as const;

/**
 * Matches the real backend's CreateTaskTemplateDto/UpdateTaskTemplateDto.
 * The MVP UI only edits `title`/`type`; `description`, `subShiftTemplateId`,
 * `isActive`, `sortOrder`, and `note` are left at their backend defaults.
 */
export const taskTemplateFormSchema = z.object({
  branchId: z.number(),
  masterShiftTemplateId: z.number().optional(),
  subShiftTemplateId: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(TASK_TEMPLATE_TYPE),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
  note: z.string().optional(),
});

export const createTaskTemplateSchema = taskTemplateFormSchema;

export const updateTaskTemplateSchema = taskTemplateFormSchema.partial();

/**
 * Full entity as returned by the backend.
 */
export const taskTemplateSchema = taskTemplateFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
});
