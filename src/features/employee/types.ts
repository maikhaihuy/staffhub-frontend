import { Branch } from "../branch/types";
import { z } from "zod";

export type Employee = z.infer<typeof employeeSchema>;

export const employeeSchema = z.object({
  id: z.number(), // for update, not required on create
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

// const sampleDate = ["2025-10-13", "2025-10-14", "2025-10-15", "2025-10-16", "2025-10-17", "2025-10-18", "2025-10-19"];
// const sampleStartTime = ["07:00", "12:00", "17:00"];
// const smapleEndTime = ["12:00", "17:00", "22:00"];

// const sampleDateTime = (date: string, time: string) => new Date(`${date}T${time}`);

// const smapleAvailabilities = (index: number) => {
//   const availabilities: Availability[] = [];
//   sampleDate.map((date, idx) => {
//     const max = (index % (idx + 1)) % sampleStartTime.length;
//     for(let i = 0; i < max; i++) {
//       availabilities.push({employeeId: index, startTime: sampleDateTime(sampleDate[idx], sampleStartTime[i]), endTime: sampleDateTime(sampleDate[idx], smapleEndTime[i])});
//     }
//   })
//   return availabilities;
// }

// Sample employees
export const sampleEmployees: Employee[] = [
  { id: 1, name: "Sarah Johnson", phone: "123-456-7890", branchIds: [1, 2]},
  { id: 2, name: "Mike Chen", phone: "987-654-3210", branchIds: [1, 3]},
  { id: 3, name: "Emily Davis", phone: "555-555-5555", branchIds: [1, 2, 3]},
  { id: 4, name: "James Wilson", phone: "111-222-3333", branchIds: [1, 2, 3]},
  { id: 5, name: "Lisa Rodriguez", phone: "444-555-6666", branchIds: [1, 2, 3]},
  { id: 6, name: "David Kim", phone: "123-456-7890", branchIds: [1, 2]},
  { id: 7, name: "Anna Martinez", phone: "987-654-3210", branchIds: [1, 3]},
];
