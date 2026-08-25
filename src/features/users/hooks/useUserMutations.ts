import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { User, CreateUserDTO, UpdateUserInput } from "@/features/users/types";
import { userService } from "@/features/users/services/user.service";

export const useCreateUser = () =>
  useAppMutation<User, CreateUserDTO>((data) => userService.create(data), {
    invalidateKey: queryKeys.users.all(),
    successMessage: "User created",
  });

export const useUpdateUser = () =>
  useAppMutation<User, UpdateUserInput>(({ id, ...data }) => userService.update(id, data), {
    invalidateKey: queryKeys.users.all(),
    successMessage: "User updated",
  });

export const useDeleteUser = () =>
  useAppMutation<void, number>((id) => userService.remove(id), {
    invalidateKey: queryKeys.users.all(),
    successMessage: "User deleted",
  });

export const useAssignUserRoles = () =>
  useAppMutation<User, { userId: number; roleIds: number[] }>(
    ({ userId, roleIds }) => userService.assignRoles(userId, roleIds),
    { invalidateKey: queryKeys.users.all() }
  );

export const useRemoveUserRole = () =>
  useAppMutation<User, { userId: number; roleId: number }>(
    ({ userId, roleId }) => userService.removeRole(userId, roleId),
    { invalidateKey: queryKeys.users.all() }
  );

export const useAssignManagerBranches = () =>
  useAppMutation<void, { userId: number; branchIds: number[] }>(
    ({ userId, branchIds }) => userService.assignManagerBranches(userId, branchIds),
    { successMessage: "Managed branches updated" }
  );

export const useRemoveManagerBranch = () =>
  useAppMutation<void, { userId: number; branchId: number }>(
    ({ userId, branchId }) => userService.removeManagerBranch(userId, branchId),
    { successMessage: "Managed branch removed" }
  );
