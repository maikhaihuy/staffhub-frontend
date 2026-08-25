import { z } from "zod";
import {
  roleSchema,
  roleFormSchema,
  createRoleSchema,
  updateRoleSchema,
} from "./schemas/role.schema";

export type Role = z.infer<typeof roleSchema>;
export type RoleFormValues = z.infer<typeof roleFormSchema>;
export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;
export type UpdateRoleInput = UpdateRoleDTO & { id: number };
