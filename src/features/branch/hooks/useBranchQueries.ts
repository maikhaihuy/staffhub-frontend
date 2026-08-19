import { sampleEmployees } from "@/mocks/data/employees";
import { Branch, BranchWithSchedules, BranchWithShifts } from "@/features/branch/types";
import { sampleBranchesWithShifts, sampleBranchesWithSchedules } from "@/mocks/data/branches";
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

// NOTE: the backend has no `/branches/:id/shifts` or `/branches/:id/schedules`
// endpoints (they're commented out in branch.controller.ts) - these stay
// mocked until that lands.
const getBranchWithSchedules = async (
  employeeId?: number
): Promise<BranchWithSchedules> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const branches = sampleBranchesWithSchedules();
  const employee = sampleEmployees.find((emp) => emp.id === employeeId);
  console.log(employee);
  return (
    branches.find((branch) => employee?.branchIds.includes(branch.id)) ||
    branches[0]
  );
};

export const useGetBranchesWithSchedules = (employeeId: number) =>
  useAppQuery(
    queryKeys.branches.withSchedules(employeeId),
    () => getBranchWithSchedules(employeeId),
    { enabled: !!employeeId }
  );

const getBranchesWithShifts = async (): Promise<BranchWithShifts[]> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleBranchesWithShifts();
};

export const useGetBranchesWithShifts = () =>
  useAppQuery(queryKeys.branches.withShifts(), getBranchesWithShifts);
