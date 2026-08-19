import { z } from "zod";
import {
  assignmentSchema,
  assignmentFormSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  checkInSchema,
  checkOutSchema,
} from "../schemas";

export type Assignment = z.infer<typeof assignmentSchema>;
export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;
export type CreateAssignmentDTO = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentDTO = z.infer<typeof updateAssignmentSchema>;
export type UpdateAssignmentInput = UpdateAssignmentDTO & { id: number };
export type CheckInDTO = z.infer<typeof checkInSchema>;
export type CheckOutDTO = z.infer<typeof checkOutSchema>;
