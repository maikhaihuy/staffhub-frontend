import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { queryKeys } from "@/lib/queryKeys";
import { permissionService } from "../services/permission.service";
import { rolePermissionService } from "../services/rolePermission.service";
import { abilityService } from "../services/ability.service";
import { AbilityRule, Permission, RolePermission } from "../types";

export const useGetPermissions = () =>
  useAppQuery<Permission[]>(queryKeys.permissions.all(), permissionService.list);

export const useGetPermission = (permissionId: number) =>
  useAppQuery<Permission>(
    queryKeys.permissions.detail(permissionId),
    () => permissionService.getById(permissionId),
    { enabled: !!permissionId }
  );

export const useGetRolePermissions = (roleId: number) =>
  useAppQuery<RolePermission[]>(
    queryKeys.rolePermissions.byRole(roleId),
    () => rolePermissionService.getByRole(roleId),
    { enabled: !!roleId }
  );

export const useGetUserAbilities = (userId: number) =>
  useAppQuery<AbilityRule[]>(
    queryKeys.abilities.byUser(userId),
    () => abilityService.getForUser(userId),
    { enabled: !!userId }
  );
