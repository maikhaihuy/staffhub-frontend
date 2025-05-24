import { z } from 'zod';

export type Employee = z.infer<typeof employeeSchema>;

export const employeeSchema = z.object({
  id: z.string().optional(), // for update, not required on create
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['employee', 'admin'])
});