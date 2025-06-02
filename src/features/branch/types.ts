import { z } from 'zod';

export type Branch = z.infer<typeof branchSchema>;

export const branchSchema = z.object({
  id: z.string().optional(), // for update, not required on create
  name: z.string(),
  abbreviation: z.string(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
});