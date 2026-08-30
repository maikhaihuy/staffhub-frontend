import { Branch } from "@/features/branch/types";
import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { branchService } from "../services/branch.service";

export const useGetBranches = () =>
  useAppQuery<Branch[]>(queryKeys.branches.all(), branchService.list);

export const useGetBranch = (branchId: number) =>
  useAppQuery<Branch>(
    queryKeys.branches.detail(branchId),
    () => branchService.getById(branchId),
    { enabled: !!branchId }
  );
