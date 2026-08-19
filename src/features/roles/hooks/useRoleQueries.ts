import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { roleService } from "../services/role.service";
import { Role } from "../types";

export const useGetRoles = () =>
  useAppQuery<Role[]>(["roles"], roleService.list);
