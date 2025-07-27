import { Branch } from "../branch/types";
import { z } from "zod";

export interface Employee {
  id?: number; // Optional for create, required for update
  name: string;
  phone: string;
  avatar?: string; // Optional avatar field
  email?: string; // Optional email field with validation
  address?: string; // Optional address field
  isActive: boolean; // Indicates if the employee is active

  // Optional fields for auditing
  createdAt: Date; // Optional created date
  updatedAt: Date; // Optional updated date
  createdBy: number; // Optional user ID who created the record
  updatedBy: number; // Optional user ID who updated the record

  // Many-to-many relation with branches
  branches: Branch[]; // Array of branches linked to the employee
  branchIds: number[]; // Optional array of branch IDs for multi-branch assignment

  // Additional fields can be added as needed
  // status?: "active" | "inactive"; // Optional status field
  // level?: number; // Optional level field, must be a positive number
  // branch?: string; // Optional branch field, can be used for display purposes
  // availableAt?: string; // Optional availability date/time field
  // role?: "employee" | "admin"; // Optional role field
}

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const employeeSchema = z.object({
  id: z.number().optional(), // for update, not required on create
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  avatar: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  address: z.string().optional(),
  isActive: z.boolean(), // Default to true if not provided

  branchIds: z.array(z.number().min(1, "Branch is required")),

  // status: z.enum(['active', 'inactive']).optional(),
  // level: z.number().min(0, 'Level must be a positive number').optional(),
  // branch: z.string().optional(),

  // role: z.enum(['employee', 'admin'])
});
