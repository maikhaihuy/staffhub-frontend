import z from "zod";
import {
  employeeSchema,
  employeeFormSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
} from "../schemas/employee.schema";

/**
 * Full Employee entity (EmployeeResponseDto) - already includes `branches`.
 */
export type Employee = z.infer<typeof employeeSchema>;

/**
 * Editable form fields (create + update forms share this shape)
 */
export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

/**
 * Create Employee DTO (Data Transfer Object)
 */
export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;

/**
 * Update Employee DTO
 */
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;

/**
 * Update mutation input - the DTO plus which employee it targets
 */
export type UpdateEmployeeInput = UpdateEmployeeDTO & { id: number };

/**
 * @deprecated The backend already embeds `branches` on every Employee
 * response - use `Employee` directly.
 */
export type EmployeeWithBranches = Employee;
