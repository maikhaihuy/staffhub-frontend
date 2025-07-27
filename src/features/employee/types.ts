import { Branch } from "../branch/types";
import { z } from "zod";

export type Employee = z.infer<typeof employeeSchema>;

export const employeeSchema = z.object({
  id: z.number().optional(), // for update, not required on create
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  branchIds: z.array(z.number().min(1, "Branch is required")),
  // avatar: z.string().optional(),
  // status: z.enum(['active', 'inactive']).optional(),
  // level: z.number().min(0, 'Level must be a positive number').optional(),
  // branch: z.string().optional(),
  // // availableAt: z.string().optional(),

  // email: z.string().email('Invalid email'),
  // role: z.enum(['employee', 'admin'])
});

// Employee with branches response type
export type EmployeeWithBranches = Employee & {
  branches: Branch[];
};
