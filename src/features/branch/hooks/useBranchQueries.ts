import { sampleEmployees } from "@/mocks/data/employees";
import {
  Branch,
  BranchWithSchedules,
  BranchWithShifts,
} from "@/features/branch/types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axios from "@/lib/api/axios";
import { sampleBranchesWithShifts, sampleBranchesWithSchedules } from "@/mocks/data/branches";
import { queryKeys } from "@/lib/queryKeys";
import { useQuery } from "@tanstack/react-query";

const getBranches = async (): Promise<Branch[]> => {
  const res = await axios.get(API_ENDPOINTS.BRANCHES.BASE);
  return res.data;
};

export const useGetBranches = () =>
  useQuery({
    queryKey: queryKeys.branches.all(),
    queryFn: getBranches,
  });

const getBranch = async (id: number): Promise<Branch> => {
  const res = await axios.get(`${API_ENDPOINTS.BRANCHES.BASE}/${id}`);
  return res.data;
};

export const useGetBranch = (branchId: number) =>
  useQuery({
    queryKey: queryKeys.branches.detail(+branchId),
    queryFn: () => getBranch(+branchId),
    enabled: !!branchId,
  });

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
  useQuery({
    queryKey: queryKeys.branches.withSchedules(employeeId),
    queryFn: () => getBranchWithSchedules(employeeId),
    enabled: !!employeeId,
  });

const getBranchesWithShifts = async (): Promise<BranchWithShifts[]> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleBranchesWithShifts();
};

export const useGetBranchesWithShifts = () =>
  useQuery({
    queryKey: queryKeys.branches.withShifts(),
    queryFn: getBranchesWithShifts,
    enabled: true,
  });

const getBranchesWithPaging = async ({
  page,
  pageSize,
  all,
}: {
  page?: number;
  pageSize?: number;
  all?: boolean;
}): Promise<{ data: Branch[]; total: number }> => {
  const res = await axios.get(
    `${API_ENDPOINTS.BRANCHES.BASE}?all=${all}&page=${page}&pageSize=${pageSize}`
  );
  return res.data;
};

export const useGetBranchesWithPaging = ({
  page,
  pageSize,
  all,
}: {
  page?: number;
  pageSize?: number;
  all?: boolean;
}) =>
  useQuery({
    queryKey: queryKeys.branches.list({ page, pageSize, all }),
    queryFn: () => getBranchesWithPaging({ page, pageSize, all }),
  });
