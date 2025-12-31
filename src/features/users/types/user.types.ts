import { z } from 'zod';
import {
  userSchema,
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from '../schemas/user.schema';

/**
 * Base User Type
 */
export type User = z.infer<typeof userSchema>;

/**
 * Create User DTO (Data Transfer Object)
 */
export type CreateUserDTO = z.infer<typeof createUserSchema>;

/**
 * Update User DTO
 */
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

/**
 * User Query Params
 */
export type UserQueryParams = z.infer<typeof userQuerySchema>;
