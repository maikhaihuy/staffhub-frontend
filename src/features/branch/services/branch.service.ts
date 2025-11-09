import { sampleEmployees } from "@/mocks/data/employees";
import {
  Branch,
  BranchWithSchedules,
  BranchWithShifts,
} from "../types/branch.types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axios from "@/lib/api/axios";
import { sampleBranchesWithShifts, sampleBranchesWithSchedules } from "@/mocks/data/branches";

class BranchService {
  async getBranchesWithShifts(
    employeeId?: number
  ): Promise<BranchWithShifts[]> {
    console.log(employeeId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return sampleBranchesWithShifts();
  }

  async getBranchWithSchedules(
    employeeId?: number
  ): Promise<BranchWithSchedules> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const branches = sampleBranchesWithSchedules();
    const employee = sampleEmployees.find((emp) => emp.id === employeeId);
    console.log(employee);
    return (
      branches.find((branch) => employee?.branchIds.includes(branch.id)) ||
      branches[0]
    );
  }

  async getBranchesWithPaging({
    page,
    pageSize,
    all,
  }: {
    page?: number;
    pageSize?: number;
    all?: boolean;
  }): Promise<{ data: Branch[]; total: number }> {
    const res = await axios.get(
      `${API_ENDPOINTS.BRANCHES}?all=${all}page=${page}&pageSize=${pageSize}`
    );
    return res.data;
  }

  async getBranches(): Promise<Branch[]> {
    const res = await axios.get(API_ENDPOINTS.BRANCHES);
    return res.data;
  }

  async getBranch(id: number): Promise<Branch> {
    const res = await axios.get(`${API_ENDPOINTS.BRANCHES}/${id}`);
    return res.data;
  }

  async create(data: Partial<Branch>) {
    const res = await axios.post(API_ENDPOINTS.BRANCHES, data);
    return res.data;
  }

  async update(id: number, data: Partial<Branch>) {
    const res = await axios.put(`${API_ENDPOINTS.BRANCHES}/${id}`, data);
    return res.data;
  }

  async remove(id: number) {
    const res = await axios.delete(`${API_ENDPOINTS.BRANCHES}/${id}`);
    return res.data;
  }
}

export const branchService = new BranchService();
