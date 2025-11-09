import {
  getBranches,
  getBranch,
  getBranchWithSchedules,
  getBranchesWithShifts,
} from "@/features/branch/api";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

export const useGetBranches = () =>
  useQuery({
    queryKey: queryKeys.branches.all(),
    queryFn: () => getBranches(),
  });

export const useGetBranch = (branchId: number) =>
  useQuery({
    queryKey: queryKeys.branches.detail(+branchId),
    queryFn: () => getBranch(+branchId),
    enabled: !!branchId,
  });

export const useGetBranchesWithSchedules = (employeeId: number) =>
  useQuery({
    queryKey: queryKeys.branches.withSchedules(employeeId),
    queryFn: () => getBranchWithSchedules(employeeId),
    enabled: !!employeeId,
  });

export const useGetBranchesWithShifts = (employeeId: number) =>
  useQuery({
    queryKey: queryKeys.branches.withShifts(employeeId),
    queryFn: () => getBranchesWithShifts(employeeId),
    enabled: !!employeeId,
  });
