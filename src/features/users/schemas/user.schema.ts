import { z } from "zod";

export const USER_STATUS = ["ACTIVE", "INACTIVE"] as const;

/**
 * Fields editable via the create/update form - matches the real backend's
 * CreateUserDto/UpdateUserDto (see staffhub-backend/.../create-user.dto.ts).
 */
export const userFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(USER_STATUS),
  roleId: z.number({ message: "Role is required" }),
});

export const createUserSchema = userFormSchema;

export const updateUserSchema = userFormSchema.partial();

/**
 * Full entity as returned by the backend (UserResponseDto).
 */
export const userSchema = userFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roleName: z.string().optional(),
  branches: z
    .array(
      z.object({
        branchId: z.number(),
        branchName: z.string(),
        isPrimary: z.boolean(),
      })
    )
    .optional(),
});
