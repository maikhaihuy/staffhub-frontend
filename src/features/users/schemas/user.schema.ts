import { z } from "zod";

export const userSchema = z.object({
  id: z.number(), // for update, not required on create
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]), // UserStatus enum values
});

/**
 * Create User Schema - ID is not allowed
 */
export const createUserSchema = userSchema.omit({ id: true });

/**
 * Update User Schema - All fields optional except ID
 */
export const updateUserSchema = userSchema
  .partial()
  .required({ id: true });

/**
 * User Query Params Schema
 */
export const userQuerySchema = z.object({
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['username', 'status', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});