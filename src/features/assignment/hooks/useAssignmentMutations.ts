import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  Assignment,
  CreateAssignmentDTO,
  UpdateAssignmentInput,
  CheckInDTO,
  CheckOutDTO,
} from "../types";
import { assignmentService } from "../services/assignment.service";

// Assignments are cached under both `bySubShift` and `byEmployee` keys
// (admin roster view vs. employee availability view), so mutations
// invalidate the whole `["assignments"]` prefix rather than one narrow key.
export const useCreateAssignment = () =>
  useAppMutation<Assignment, CreateAssignmentDTO>(
    (data) => assignmentService.create(data),
    {
      invalidateKey: queryKeys.assignments.all(),
      successMessage: "Assignment created",
    }
  );

export const useUpdateAssignment = () =>
  useAppMutation<Assignment, UpdateAssignmentInput>(
    ({ id, ...data }) => assignmentService.update(id, data),
    {
      invalidateKey: queryKeys.assignments.all(),
      successMessage: "Assignment updated",
    }
  );

export const useDeleteAssignment = () =>
  useAppMutation<void, number>((id) => assignmentService.remove(id), {
    invalidateKey: queryKeys.assignments.all(),
    successMessage: "Assignment removed",
  });

export const useCheckInAssignment = () =>
  useAppMutation<Assignment, { id: number; data: CheckInDTO }>(
    ({ id, data }) => assignmentService.checkIn(id, data),
    { invalidateKey: queryKeys.assignments.all() }
  );

export const useCheckOutAssignment = () =>
  useAppMutation<Assignment, { id: number; data: CheckOutDTO }>(
    ({ id, data }) => assignmentService.checkOut(id, data),
    { invalidateKey: queryKeys.assignments.all() }
  );
