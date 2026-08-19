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
