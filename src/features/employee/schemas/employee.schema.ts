import { z } from "zod";

/**
 * Fields editable via the create/update form - matches the real backend's
 * CreateEmployeeDto/UpdateEmployeeDto (see
 * staffhub-backend/.../create-employee.dto.ts). The form only surfaces
 * fullName/phoneNumber/branchIds today; the rest of the DTO
 * (email/address/avatar/dates/primaryBranchId) has no UI yet.
 */
export const employeeFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone is required"),
  branchIds: z.array(z.number()).min(1, "At least one branch is required"),
});

export const createEmployeeSchema = employeeFormSchema;

export const updateEmployeeSchema = employeeFormSchema.partial();

/**
 * Full entity as returned by the backend (EmployeeResponseDto).
 */
export const employeeSchema = employeeFormSchema.extend({
  id: z.number(),
  /**
   * Only present in the POST /employees create response - the backend
   * provisions a one-time password for the linked User account and returns
   * it here exactly once (never again, and never on GET/list). Not shown to
   * the employee automatically yet - an admin must relay it out of band.
   */
  temporaryPassword: z.string().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  probationStartDate: z.string().nullable().optional(),
  officialStartDate: z.string().nullable().optional(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  user: z
    .object({ id: z.number(), fullName: z.string() })
    .nullable()
    .optional(),
  branches: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        abbreviation: z.string(),
      })
    )
    .optional(),
});
