import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Employee, CreateEmployeeDTO, UpdateEmployeeDTO } from "../types";

// Real backend uses PATCH for employee updates (see schema.d.ts EmployeesController_update)
export const employeeService = createCrudService<Employee, CreateEmployeeDTO, UpdateEmployeeDTO>(
  API_ENDPOINTS.EMPLOYEES.BASE
);
