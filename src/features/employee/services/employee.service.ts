import axios from "@/lib/api/axios";
import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO, SelfUpdateEmployeeDTO } from "../types";

// Real backend uses PATCH for employee updates (see schema.d.ts EmployeesController_update)
export const employeeService = createCrudService<Employee, CreateEmployeeDTO, UpdateEmployeeDTO>(
  API_ENDPOINTS.EMPLOYEES.BASE
);

// Self-service profile update (PATCH /employees/me) - the target employee is
// resolved from the caller's own JWT, not an :id param.
export const updateMyProfile = async (data: SelfUpdateEmployeeDTO): Promise<Employee> => {
  const res = await axios.patch<Employee>(API_ENDPOINTS.EMPLOYEES.ME, data);
  return res.data;
};
