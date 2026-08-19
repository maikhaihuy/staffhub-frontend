import { Employee } from "@/features/employee/types";

const AUDIT_FIELDS = {
  createdAt: new Date().toISOString(),
  createdBy: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 1,
};

// Sample employees
export const sampleEmployees: Employee[] = [
  { id: 1, fullName: "Sarah Johnson", phoneNumber: "123-456-7890", branchIds: [1, 2], ...AUDIT_FIELDS },
  { id: 2, fullName: "Mike Chen", phoneNumber: "987-654-3210", branchIds: [1, 3], ...AUDIT_FIELDS },
  { id: 3, fullName: "Emily Davis", phoneNumber: "555-555-5555", branchIds: [1, 2, 3], ...AUDIT_FIELDS },
  { id: 4, fullName: "James Wilson", phoneNumber: "111-222-3333", branchIds: [1, 2, 3], ...AUDIT_FIELDS },
  { id: 5, fullName: "Lisa Rodriguez", phoneNumber: "444-555-6666", branchIds: [1, 2, 3], ...AUDIT_FIELDS },
  { id: 6, fullName: "David Kim", phoneNumber: "123-456-7890", branchIds: [1, 2], ...AUDIT_FIELDS },
  { id: 7, fullName: "Anna Martinez", phoneNumber: "987-654-3210", branchIds: [1, 3], ...AUDIT_FIELDS },
];
