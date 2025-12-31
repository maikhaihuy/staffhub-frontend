import { sampleEmployees } from "@/mocks/data/employees";
import { Employee, EmployeeWithBranches } from "../types/employee.types";
import axios from "@/lib/api/axios";

const ENDPONT_NAME = "/api/employees";

export const getEmployeesWithPaging = async (
  page: number,
  pageSize: number
): Promise<{ data: EmployeeWithBranches[]; total: number }> => {
  const res = await axios.get(
    `${ENDPONT_NAME}?page=${page}&pageSize=${pageSize}`
  );
  return res.data;
};

export const getEmployees = async (branchId?: number): Promise<Employee[]> => {
  // const res = await axios.get(ENDPONT_NAME);
  // return res.data;
  console.log('getEmployees branchId', branchId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleEmployees;
}

export const getEmployeesWithAccount = async (branchId?: number): Promise<Employee[]> => {
  console.log('getEmployeesWithAccount branchId', branchId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return sampleEmployees;
}

export const getEmployeesByBranch = async (branchId: number): Promise<Employee[]> => {
  const res = await axios.get(`api/branches/${branchId}/employees`);
  return res.data;
}

export const getEmployee = async (
  id: number
): Promise<EmployeeWithBranches> => {
  const res = await axios.get(`${ENDPONT_NAME}/${id}`);
  return res.data;
};

export const create = async (data: Partial<Employee>) => {
  const res = await axios.post(ENDPONT_NAME, data);
  return res.data;
};

export const update = async (id: number, data: Partial<Employee>) => {
  const res = await axios.put(`${ENDPONT_NAME}/${id}`, data);
  return res.data;
};

export const remove = async (id: number) => {
  const res = await axios.delete(`${ENDPONT_NAME}/${id}`);
  return res.data;
};
