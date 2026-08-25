import { FormErrorSetter, useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { Role, CreateRoleDTO, UpdateRoleInput } from "../types";
import { roleService } from "../services/role.service";

export const useCreateRole = (form?: FormErrorSetter) =>
  useAppMutation<Role, CreateRoleDTO>((data) => roleService.create(data), {
    invalidateKey: queryKeys.roles.all(),
    successMessage: "Role created",
    form,
  });

export const useUpdateRole = (form?: FormErrorSetter) =>
  useAppMutation<Role, UpdateRoleInput>(({ id, ...data }) => roleService.update(id, data), {
    invalidateKey: queryKeys.roles.all(),
    successMessage: "Role updated",
    form,
  });

export const useDeleteRole = () =>
  useAppMutation<void, number>((id) => roleService.remove(id), {
    invalidateKey: queryKeys.roles.all(),
    successMessage: "Role deleted",
  });
