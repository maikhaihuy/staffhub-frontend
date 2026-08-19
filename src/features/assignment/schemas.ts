import { z } from "zod";

export const WORK_SLOT_STATUS = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "ABSENT"] as const;

/**
 * Matches the real backend's CreateAssignmentDto/UpdateAssignmentDto.
 */
export const assignmentFormSchema = z.object({
  employeeId: z.number(),
  subShiftId: z.number(),
  availabilityId: z.number().optional(),
  assignedAt: z.string().optional(),
  status: z.enum(WORK_SLOT_STATUS).optional(),
  note: z.string().optional(),
});

export const createAssignmentSchema = assignmentFormSchema;

export const updateAssignmentSchema = assignmentFormSchema.partial();

export const checkInSchema = z.object({
  actualStartTime: z.string().optional(),
  note: z.string().optional(),
});

export const checkOutSchema = z.object({
  actualEndTime: z.string().optional(),
  note: z.string().optional(),
});

/**
 * Full entity as returned by the backend - embeds enough of employee/subShift
 * to render an assignment without extra fetches (see assignment.service.ts's
 * `include` in the backend).
 */
export const assignmentSchema = assignmentFormSchema.extend({
  id: z.number(),
  actualStartTime: z.string().nullable().optional(),
  actualEndTime: z.string().nullable().optional(),
  createdAt: z.string(),
  createdBy: z.number(),
  updatedAt: z.string(),
  updatedBy: z.number(),
  employee: z
    .object({ id: z.number(), fullName: z.string(), phoneNumber: z.string() })
    .optional(),
  subShift: z
    .object({
      id: z.number(),
      title: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      masterShift: z
        .object({
          id: z.number(),
          branchId: z.number(),
          title: z.string(),
          workDate: z.string(),
        })
        .optional(),
    })
    .optional(),
});
