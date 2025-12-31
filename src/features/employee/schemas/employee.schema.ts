import { z } from "zod";
import { branchSchema } from "../../branch/schemas/branch.schema";

/**
 * Base Employee Schema - Used for validation
 */
export const employeeSchema = z.object({
  id: z.number(), // for update, not required on create
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  branchIds: z.array(z.number().min(1, "Branch is required")),
  // avatar: z.string().optional(),
  // status: z.enum(['active', 'inactive']).optional(),
  // level: z.number().min(0, 'Level must be a positive number').optional(),
  // branch: z.string().optional(),
  // // availableAt: z.string().optional(),

  // email: z.string().email('Invalid email'),
  // role: z.enum(['employee', 'admin'])
});

/**
 * Create Employee Schema - ID is not allowed
 */
export const createEmployeeSchema = employeeSchema.omit({ id: true });

/**
 * Update Employee Schema - All fields optional except ID
 */
export const updateEmployeeSchema = employeeSchema
  .partial()
  .required({ id: true });

/**
 * Employee Query Params Schema
 */
export const employeeQuerySchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'phone', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Employee with Branches Schema
 */
export const employeeWithBranchesSchema = employeeSchema.extend({
  branches: z.array(branchSchema),
});
