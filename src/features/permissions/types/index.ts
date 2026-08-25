import { z } from "zod";
import {
  permissionSchema,
  permissionFormSchema,
  createPermissionSchema,
  updatePermissionSchema,
} from "../schemas/permission.schema";

export type Permission = z.infer<typeof permissionSchema>;
export type PermissionFormValues = z.infer<typeof permissionFormSchema>;
export type CreatePermissionDTO = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionDTO = z.infer<typeof updatePermissionSchema>;
export type UpdatePermissionInput = UpdatePermissionDTO & { id: number };

/**
 * Row-scoping condition attached to a role's grant of a permission (lives on
 * the grant, not on the permission definition itself - see design.md).
 * Opaque JSON; may contain backend-resolved tokens like `$self`.
 */
export type PermissionCondition = Record<string, unknown>;

export type PermissionGrant = {
  permissionId: number;
  condition?: PermissionCondition;
};

export type RolePermission = {
  roleId: number;
  permissionId: number;
  roleName?: string;
  action?: string;
  subject?: string;
  condition?: PermissionCondition | null;
};

/**
 * A resolved CASL rule as returned by GET /me/abilities and
 * GET /users/:id/abilities - `conditions` is already resolved server-side
 * (e.g. `$self` substituted), unlike `PermissionGrant.condition` above which
 * may still carry unresolved tokens.
 */
export type AbilityRule = {
  action: string;
  subject: string;
  inverted: boolean;
  conditions?: Record<string, unknown>;
};
