import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { queryKeys } from "@/lib/queryKeys";
import { roleService } from "../services/role.service";
import { Role } from "../types";

export const useGetRoles = () =>
  useAppQuery<Role[]>(queryKeys.roles.all(), roleService.list);

export const useGetRole = (roleId: number) =>
  useAppQuery<Role>(
    queryKeys.roles.detail(roleId),
    () => roleService.getById(roleId),
    { enabled: !!roleId }
  );
