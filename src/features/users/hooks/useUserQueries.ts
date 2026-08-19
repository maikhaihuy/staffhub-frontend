import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { userService } from "@/features/users/services/user.service";
import { User } from "@/features/users/types";

export const useGetUsers = () =>
  useAppQuery<User[]>(queryKeys.users.all(), userService.list);

export const useGetUser = (userId: number) =>
  useAppQuery<User>(
    queryKeys.users.detail(userId),
    () => userService.getById(userId),
    { enabled: !!userId }
  );
