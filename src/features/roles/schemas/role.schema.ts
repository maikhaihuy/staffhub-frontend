import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(1, { message: "Role name is required" }),
  description: z.string().optional(),
});

export const createRoleSchema = roleFormSchema.extend({
  permissionIds: z.array(z.number()),
});

export const updateRoleSchema = roleFormSchema.partial();

const roleGrantedPermissionSchema = z.object({
  id: z.number(),
  action: z.string(),
  subject: z.string(),
});

export const roleSchema = roleFormSchema.extend({
  id: z.number(),
  isSystemRole: z.boolean(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  permissions: z.array(roleGrantedPermissionSchema),
});
