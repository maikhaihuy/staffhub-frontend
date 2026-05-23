import { z } from "zod";
import { shiftSchema } from "../shift/schemas/shift.schema";
import { scheduleSchema } from "../schedule/schemas/schedule.schema";

export const branchSchema = z.object({
  id: z.number(), // for update, not required on create
  name: z.string().min(1, { message: "Branch name is required" }),
  abbreviation: z.string().min(1, { message: "Abbreviation name is required" }),
  address: z.string().min(1, { message: "Abbreviation name is required" }),
  phone: z.string().optional(),
  email: z
    .string()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
});

/**
 * Create Branch Schema - ID is not allowed
 */
export const createBranchSchema = branchSchema.omit({ id: true });

/**
 * Update Branch Schema - All fields optional except ID
 */
export const updateBranchSchema = branchSchema
  .partial()
  .required({ id: true });

/**
 * Branch Query Params Schema
 */
export const branchQuerySchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'abbreviation', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const branchWithShiftsSchema = branchSchema.extend({
  shifts: z.array(shiftSchema),
});

export const branchWithSchedulesSchema = branchSchema.extend({
  schedules: z.array(scheduleSchema),
});
