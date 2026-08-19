import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { assignmentService } from "../services/assignment.service";
import { Assignment } from "../types";

export const useGetAssignmentsBySubShift = (subShiftId: number) =>
  useAppQuery<Assignment[]>(
    queryKeys.assignments.bySubShift(subShiftId),
    () => assignmentService.listBySubShift(subShiftId),
    { enabled: !!subShiftId }
  );

export const useGetAssignmentsByEmployee = (employeeId: number) =>
  useAppQuery<Assignment[]>(
    queryKeys.assignments.byEmployee(employeeId),
    () => assignmentService.listByEmployee(employeeId),
    { enabled: !!employeeId }
  );
