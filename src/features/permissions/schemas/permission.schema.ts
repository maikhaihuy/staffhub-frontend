import { z } from "zod";

export const permissionFormSchema = z.object({
  action: z.string().min(1, { message: "Action is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  description: z.string().optional(),
});

export const createPermissionSchema = permissionFormSchema;
export const updatePermissionSchema = permissionFormSchema.partial();

const permissionGrantedRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const permissionSchema = permissionFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  roles: z.array(permissionGrantedRoleSchema),
});
