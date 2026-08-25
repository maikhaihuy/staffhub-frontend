import { FormErrorSetter, useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  Permission,
  CreatePermissionDTO,
  UpdatePermissionInput,
  PermissionGrant,
  RolePermission,
} from "../types";
import { permissionService } from "../services/permission.service";
import { rolePermissionService } from "../services/rolePermission.service";

export const useCreatePermission = (form?: FormErrorSetter) =>
  useAppMutation<Permission, CreatePermissionDTO>(
    (data) => permissionService.create(data),
    {
      invalidateKey: queryKeys.permissions.all(),
      successMessage: "Permission created",
      form,
    }
  );

export const useUpdatePermission = (form?: FormErrorSetter) =>
  useAppMutation<Permission, UpdatePermissionInput>(
    ({ id, ...data }) => permissionService.update(id, data),
    {
      invalidateKey: queryKeys.permissions.all(),
      successMessage: "Permission updated",
      form,
    }
  );

export const useDeletePermission = () =>
  useAppMutation<void, number>((id) => permissionService.remove(id), {
    invalidateKey: queryKeys.permissions.all(),
    successMessage: "Permission deleted",
  });

export const useAssignRolePermissions = (roleId: number) =>
  useAppMutation<RolePermission[], PermissionGrant[]>(
    (grants) => rolePermissionService.assign(roleId, grants),
    {
      invalidateKey: queryKeys.rolePermissions.byRole(roleId),
      successMessage: "Permissions updated",
    }
  );

export const useRemoveRolePermission = (roleId: number) =>
  useAppMutation<void, number>(
    (permissionId) => rolePermissionService.remove(roleId, permissionId),
    {
      invalidateKey: queryKeys.rolePermissions.byRole(roleId),
    }
  );
