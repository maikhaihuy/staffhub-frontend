import { Employee, EmployeeWithBranches } from "./types";
import axios from "@/lib/axios";

const ENDPONT_NAME = "/api/employees";

export const getEmployees = async (
  page: number,
  pageSize: number
): Promise<{ data: EmployeeWithBranches[]; total: number }> => {
  const res = await axios.get(
    `${ENDPONT_NAME}?page=${page}&pageSize=${pageSize}`
  );
  return res.data;
};

export const getEmployee = async (
  id: number
): Promise<EmployeeWithBranches> => {
  const res = await axios.get(`${ENDPONT_NAME}/${id}`);
  return res.data;
};

export const createEmployee = async (data: Partial<Employee>) => {
  const res = await axios.post(ENDPONT_NAME, data);
  return res.data;
};

export const updateEmployee = async (data: Partial<Employee>) => {
  const res = await axios.put(`${ENDPONT_NAME}/${data.id}`, data);
  return res.data;
};

export const deleteEmployee = async (id: string) => {
  const res = await axios.delete(`${ENDPONT_NAME}/${id}`);
  return res.data;
};
