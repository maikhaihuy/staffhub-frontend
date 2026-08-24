import { z } from "zod";
import { scheduleSchema } from "../schedule/schemas/schedule.schema";

/**
 * Fields editable via the create/update form - matches the real backend's
 * CreateBranchDto/UpdateBranchDto (see staffhub-backend/.../create-branch.dto.ts).
 */
export const branchFormSchema = z.object({
  name: z.string().min(1, { message: "Branch name is required" }),
  abbreviation: z.string().min(1, { message: "Abbreviation is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  phone: z.string().optional(),
  email: z
    .string()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    })
    .optional(),
});

export const createBranchSchema = branchFormSchema;

export const updateBranchSchema = branchFormSchema.partial();

/**
 * Full entity as returned by the backend (BranchResponseDto) - includes
 * server-assigned fields the form never touches.
 */
export const branchSchema = branchFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  employees: z.array(z.object({ id: z.number(), fullName: z.string() })).optional(),
});

export const branchWithSchedulesSchema = branchSchema.extend({
  schedules: z.array(scheduleSchema),
});
