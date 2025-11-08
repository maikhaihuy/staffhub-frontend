import { sampleEmployees } from "../employee/types";
import { sampleSchedulesWithRosters, ScheduleWithRosters } from "../schedule/types";
import { Branch, BranchWithSchedules, BranchWithShifts, sampleBranchesWithSchedules, sampleBranchesWithShifts } from "./types";
import axios from "@/lib/axios";

const ENDPONT_NAME = "/api/branches";

export const getBranchesByCurrentRole = async (): Promise<BranchWithShifts[]> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleBranchesWithShifts();
};

export const getSchedulesByBranch = async (branchId: number): Promise<ScheduleWithRosters[]> => {
  console.log('ferch scheduels include rosters, ', branchId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleSchedulesWithRosters();
}

export const getBranchWithSchedulesByEmployee = async (
  employeeId: number
): Promise<BranchWithSchedules> => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const branches = sampleBranchesWithSchedules();
  const employee = sampleEmployees.find(emp => emp.id === employeeId);
  console.log(employee);
  return branches.find(branch => employee?.branchIds.includes(branch.id)) || branches[0];
}

export const getBranches = async ({
  page,
  pageSize,
  all,
}: {
  page?: number;
  pageSize?: number;
  all?: boolean;
}): Promise<{ data: Branch[]; total: number }> => {
  const res = await axios.get(
    `${ENDPONT_NAME}?all=${all}page=${page}&pageSize=${pageSize}`
  );
  return res.data;
};

export const getBranch = async (id: number): Promise<Branch> => {
  const res = await axios.get(`${ENDPONT_NAME}/${id}`);
  return res.data;
};

export const create = async (data: Partial<Branch>) => {
  const res = await axios.post(ENDPONT_NAME, data);
  return res.data;
};

export const update = async (id: number, data: Partial<Branch>) => {
  const res = await axios.put(`${ENDPONT_NAME}/${id}`, data);
  return res.data;
};

export const remove = async (id: number) => {
  const res = await axios.delete(`${ENDPONT_NAME}/${id}`);
  return res.data;
};
