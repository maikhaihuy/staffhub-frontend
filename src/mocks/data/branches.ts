
import { Branch, BranchWithSchedules } from "../../features/branch/types";
import { sampleSchedules } from "./schedules";

const AUDIT_FIELDS = {
  createdAt: new Date().toISOString(),
  createdBy: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 1,
};

export const sampleBranches: Branch[] = [
  { id: 1, name: "Branch 1", abbreviation: "B1", address: "Address 1", phone: "123-456-7890", email: "branch1@example.com", ...AUDIT_FIELDS },
  { id: 2, name: "Branch 2", abbreviation: "B2", address: "Address 2", phone: "987-654-3210", email: "branch2@example.com", ...AUDIT_FIELDS },
  { id: 3, name: "Branch 3", abbreviation: "B3", address: "Address 3", phone: "555-555-5555", email: "branch3@example.com", ...AUDIT_FIELDS },
];

export const sampleBranchesWithSchedules = ():BranchWithSchedules[] => sampleBranches.map(branch => ({
  ...branch,
  schedules: sampleSchedules.filter(s => s.branchId === branch.id), // always where in date range
}));
