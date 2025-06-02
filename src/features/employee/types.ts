import { z } from 'zod';

export type Employee = z.infer<typeof employeeSchema>;

export const employeeSchema = z.object({
  id: z.string().optional(), // for update, not required on create
  avatar: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  level: z.number().min(0, 'Level must be a positive number').optional(),
  branch: z.string().optional(),
  // availableAt: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['employee', 'admin'])
});