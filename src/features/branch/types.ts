import { z } from 'zod';
import {
  branchSchema,
  createBranchSchema,
  updateBranchSchema,
  branchQuerySchema,
  branchWithShiftsSchema,
  branchWithSchedulesSchema,
} from './schemas';

/**
 * Base Branch Type
 */
export type Branch = z.infer<typeof branchSchema>;

/**
 * Create Branch DTO (Data Transfer Object)
 */
export type CreateBranchDTO = z.infer<typeof createBranchSchema>;

/**
 * Update Branch DTO
 */
export type UpdateBranchDTO = z.infer<typeof updateBranchSchema>;

/**
 * Branch Query Params
 */
export type BranchQueryParams = z.infer<typeof branchQuerySchema>;

export type BranchWithShifts = z.infer<typeof branchWithShiftsSchema>;

export type BranchWithSchedules = z.infer<typeof branchWithSchedulesSchema>;