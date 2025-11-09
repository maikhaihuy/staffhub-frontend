import z from "zod";
import {
  employeeSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  employeeWithBranchesSchema,
} from "../schemas/employee.schema";

/**
 * Base Employee
 */
export type Employee = z.infer<typeof employeeSchema>;

/**
 * Create Employee DTO (Data Transfer Object)
 */
export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;

/**
 * Update Employee DTO
 */
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;

/**
 * Employee Query Params
 */
export type EmployeeQueryParams = z.infer<typeof employeeQuerySchema>;

/**
 * Employee with Branches
 */
export type EmployeeWithBranches = z.infer<typeof employeeWithBranchesSchema>;
