import { z } from "zod";

export type Branch = z.infer<typeof branchSchema>;

export const branchSchema = z.object({
  id: z.number().optional(), // for update, not required on create
  name: z.string().min(1, { message: "Branch name is required" }),
  abbreviation: z.string().min(1, { message: "Abbreviation name is required" }),
  address: z.string().min(1, { message: "Abbreviation name is required" }),
  phone: z.string().optional(),
  email: z
    .string()
    .refine((val) => val === "" || z.string().email().safeParse(val).success, {
      message: "Invalid email format",
    }),
});
