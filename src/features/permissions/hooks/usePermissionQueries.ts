import { useQueries } from "@tanstack/react-query";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { queryKeys } from "@/lib/queryKeys";
import { permissionService } from "../services/permission.service";
import { rolePermissionService } from "../services/rolePermission.service";
import { abilityService } from "../services/ability.service";
import { AbilityRule, Permission, PermissionCatalogEntry, RolePermission } from "../types";

export const useGetPermissions = () =>
  useAppQuery<Permission[]>(queryKeys.permissions.all(), permissionService.list);

export const useGetPermissionCatalog = () =>
  useAppQuery<PermissionCatalogEntry[]>(
    queryKeys.permissions.catalog(),
    permissionService.getCatalog
  );

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

/**
 * Combined grants across several roles at once, e.g. to check whether any
 * role a user is about to hold resolves to a `$managedBranches`-scoped
 * permission (see the users feature's Manager-branch requirement).
 */
export const useGetRolePermissionsForRoles = (roleIds: number[]) => {
  const results = useQueries({
    queries: roleIds.map((roleId) => ({
      queryKey: queryKeys.rolePermissions.byRole(roleId),
      queryFn: () => rolePermissionService.getByRole(roleId),
      enabled: !!roleId,
      staleTime: 1000 * 60,
    })),
  });

  return {
    grants: results.flatMap((r) => (r.data as RolePermission[] | undefined) ?? []),
    isLoading: results.some((r) => r.isLoading),
  };
};
