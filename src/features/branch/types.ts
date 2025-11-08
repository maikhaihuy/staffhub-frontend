import { z } from "zod";
import { sampleShifts, Shift } from "../shift/types";
import { sampleSchedules, Schedule } from "../schedule/types";

export type Branch = z.infer<typeof branchSchema>;

export type BranchWithShifts = Branch & {
  shifts: Shift[]
}

export type BranchWithSchedules = Branch & {
  schedules: Schedule[]
}

export const branchSchema = z.object({
  id: z.number(), // for update, not required on create
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

export const sampleBranches: Branch[] = [
  { id: 1, name: "Branch 1", abbreviation: "B1", address: "Address 1", phone: "123-456-7890", email: "branch1@example.com" },
  { id: 2, name: "Branch 2", abbreviation: "B2", address: "Address 2", phone: "987-654-3210", email: "branch2@example.com" },
  { id: 3, name: "Branch 3", abbreviation: "B3", address: "Address 3", phone: "555-555-5555", email: "branch3@example.com" },
];

export const sampleBranchesWithShifts = ():BranchWithShifts[] => sampleBranches.map(branch => ({
  ...branch,
  shifts: sampleShifts.filter(s => s.branchId === branch.id)
}));

export const sampleBranchesWithSchedules = ():BranchWithSchedules[] => sampleBranches.map(branch => ({
  ...branch,
  schedules: sampleSchedules.filter(s => s.branchId === branch.id), // always where in date range
}));
