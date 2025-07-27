import { EmployeeFormData, Employee } from "./types";
import axios from "@/lib/axios";
import { QueryRequest } from "@/lib/interface";
import { buildQueryString } from "@/lib/utils";

const ENDPONT_NAME = "/api/employees";

export const getEmployees = async (
  queryRequest: QueryRequest<Employee>
): Promise<{ data: Employee[]; total: number }> => {
  const queryString = buildQueryString(queryRequest);
  const res = await axios.get(`${ENDPONT_NAME}${queryString}}`);
  return res.data;
};

export const getEmployee = async (id: number): Promise<Employee> => {
  const res = await axios.get(`${ENDPONT_NAME}/${id}`);
  return res.data;
};

export const createEmployee = async (data: Partial<EmployeeFormData>) => {
  const res = await axios.post(ENDPONT_NAME, data);
  return res.data;
};

export const updateEmployee = async (data: Partial<EmployeeFormData>) => {
  const res = await axios.put(`${ENDPONT_NAME}/${data.id}`, data);
  return res.data;
};

export const deleteEmployee = async (id: string) => {
  const res = await axios.delete(`${ENDPONT_NAME}/${id}`);
  return res.data;
};
