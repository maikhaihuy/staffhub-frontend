import { z } from "zod";
import { SHIFT_STATUS } from "../masterShiftTemplate/schemas";

export const SUB_SHIFT_TYPE = ["MAIN", "SUPPORT"] as const;

/**
 * Matches the real backend's CreateSubShiftDto/UpdateSubShiftDto. The
 * frontend currently only ever creates one "default" MAIN sub-shift per
 * master shift (see masterShift feature) - there's no UI for picking a
 * sub-shift type yet.
 */
export const subShiftFormSchema = z.object({
  masterShiftId: z.number(),
  subShiftTemplateId: z.number().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.enum(SUB_SHIFT_TYPE),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  maxAssignments: z.number().positive().optional(),
  status: z.enum(SHIFT_STATUS).optional(),
  note: z.string().optional(),
});

export const createSubShiftSchema = subShiftFormSchema;

export const updateSubShiftSchema = subShiftFormSchema.partial();

/**
 * Scalar fields only, no nested relations - matches what a plain
 * `include: { subShifts: true }` (no further nesting) returns, e.g. when
 * embedded inside a MasterShift response.
 */
export const subShiftLiteSchema = subShiftFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
});

export const subShiftSchema = subShiftLiteSchema.extend({
  masterShift: z
    .object({
      id: z.number(),
      title: z.string(),
      branchId: z.number(),
      workDate: z.string(),
    })
    .optional(),
  subShiftTemplate: z
    .object({ id: z.number(), name: z.string(), type: z.string() })
    .nullable()
    .optional(),
  tasks: z.array(z.unknown()).optional(),
});
