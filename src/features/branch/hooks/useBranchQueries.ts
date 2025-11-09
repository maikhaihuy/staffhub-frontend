import { branchService } from "@/features/branch/services/branch.service";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

export const useGetBranches = () =>
  useQuery({
    queryKey: queryKeys.branches.all(),
    queryFn: () => branchService.getBranches(),
  });

export const useGetBranch = (branchId: number) =>
  useQuery({
    queryKey: queryKeys.branches.detail(+branchId),
    queryFn: () => branchService.getBranch(+branchId),
    enabled: !!branchId,
  });

export const useGetBranchesWithSchedules = (employeeId: number) =>
  useQuery({
    queryKey: queryKeys.branches.withSchedules(employeeId),
    queryFn: () => branchService.getBranchWithSchedules(employeeId),
    enabled: !!employeeId,
  });

export const useGetBranchesWithShifts = () =>
  useQuery({
    queryKey: queryKeys.branches.withShifts(),
    queryFn: () => branchService.getBranchesWithShifts(),
    enabled: true,
  });
