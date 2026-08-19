import { z } from "zod";
import {
  userSchema,
  userFormSchema,
  createUserSchema,
  updateUserSchema,
} from "../schemas/user.schema";

/**
 * Full User entity (UserResponseDto)
 */
export type User = z.infer<typeof userSchema>;

/**
 * Editable form fields (create + update forms share this shape)
 */
export type UserFormValues = z.infer<typeof userFormSchema>;

/**
 * Create User DTO (Data Transfer Object)
 */
export type CreateUserDTO = z.infer<typeof createUserSchema>;

/**
 * Update User DTO
 */
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;

/**
 * Update mutation input - the DTO plus which user it targets
 */
export type UpdateUserInput = UpdateUserDTO & { id: number };
