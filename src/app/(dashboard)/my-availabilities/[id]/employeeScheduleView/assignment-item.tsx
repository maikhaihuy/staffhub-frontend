"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Assignment } from "@/features/assignment/types";
import { SubShiftLite } from "@/features/subShift/types";
import {
  useCreateAssignment,
  useDeleteAssignment,
} from "@/features/assignment/hooks/useAssignmentMutations";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import { ClockCheck, ClockPlus, XCircle } from "lucide-react";

const getStatusColor = (status?: string) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "ABSENT":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status?: string) => {
  switch (status) {
    case "COMPLETED":
      return <ClockCheck className="h-3 w-3" />;
    case "ABSENT":
      return <XCircle className="h-3 w-3" />;
    default:
      return <ClockPlus className="h-3 w-3" />;
  }
};

export default function AssignmentItem({
  employeeId,
  subShift,
  assignment,
}: {
  employeeId: number;
  subShift: SubShiftLite;
  assignment?: Assignment;
}) {
  const { mutate: createAssignment, isPending: isRegistering } =
    useCreateAssignment();
  const { mutate: deleteAssignment, isPending: isUnregistering } =
    useDeleteAssignment();

  // Once a shift has actually started/finished (or the employee no-showed),
  // the registration is locked - only a SCHEDULED (not-yet-started) one can
  // still be unregistered.
  const canUnregister = assignment?.status === "SCHEDULED";

  const handleRegister = () => {
    createAssignment({ employeeId, subShiftId: subShift.id });
  };

  const handleUnregister = () => {
    if (!assignment) return;
    deleteAssignment(assignment.id);
  };

  return (
    <div className="space-y-2 flex flex-col justify-center">
      <Badge
        className={`w-full flex-row justify-center gap-1 p-2 ${getStatusColor(
          assignment?.status
        )}`}
      >
        {getStatusIcon(assignment?.status)}
        <span>
          {getTime(new Date(subShift.startTime))} -{" "}
          {getTime(new Date(subShift.endTime))}
        </span>
      </Badge>
      <div className="w-full flex flex-row justify-center gap-2">
        {!assignment ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full"
          >
            Register
          </Button>
        ) : canUnregister ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleUnregister}
            disabled={isUnregistering}
            className="w-full"
          >
            Unregister
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground text-center py-1 px-2">
            {assignment.status} - View only
          </div>
        )}
      </div>
    </div>
  );
}
