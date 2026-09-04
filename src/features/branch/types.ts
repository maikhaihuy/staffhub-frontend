import { z } from 'zod';
import {
  branchSchema,
  branchFormSchema,
  createBranchSchema,
  updateBranchSchema,
} from './schemas';

/**
 * Full Branch entity (BranchResponseDto)
 */
export type Branch = z.infer<typeof branchSchema>;

/**
 * Editable form fields (create + update forms share this shape)
 */
export type BranchFormValues = z.infer<typeof branchFormSchema>;

/**
 * Create Branch DTO (Data Transfer Object)
 */
export type CreateBranchDTO = z.infer<typeof createBranchSchema>;

/**
 * Update Branch DTO
 */
export type UpdateBranchDTO = z.infer<typeof updateBranchSchema>;

/**
 * Update mutation input - the DTO plus which branch it targets
 */
export type UpdateBranchInput = UpdateBranchDTO & { id: number };
