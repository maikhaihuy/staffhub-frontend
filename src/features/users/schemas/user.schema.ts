import { z } from "zod";

export const USER_STATUS = ["ACTIVE", "INACTIVE"] as const;

/**
 * Fields editable via the create/update form - matches the real backend's
 * CreateUserDto/UpdateUserDto (see staffhub-backend/.../create-user.dto.ts).
 * `roleIds` is required on create ("the user must hold at least one"); on
 * update, the backend's UpdateUserDto has no `roleIds` field at all - role
 * membership changes go through the separate POST/DELETE
 * /users/:id/roles(/:roleId) endpoints instead (see useUserMutations.ts).
 * The form still edits `roleIds` as one field either way; detail.tsx diffs
 * it against the user's current roles on save.
 */
export const userFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  status: z.enum(USER_STATUS),
  roleIds: z.array(z.number()).min(1, "At least one role is required"),
});

export const createUserSchema = userFormSchema;

export const updateUserSchema = userFormSchema
  .omit({ roleIds: true })
  .partial();

const roleLiteSchema = z.object({
  id: z.number(),
  name: z.string(),
});

/**
 * Full entity as returned by the backend (UserResponseDto).
 */
export const userSchema = userFormSchema.omit({ roleIds: true }).extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  roles: z.array(roleLiteSchema),
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
