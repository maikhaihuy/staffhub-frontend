import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ROSTER_MODE, ROSTER_STATUS, SCHEDULE_STATUS } from "@/constants";
import { EmployeeAssignment } from "@/features/roster/types";
import { Edit2, Trash2 } from "lucide-react";

const getBackgroundStyle = (status: string, canEdit: boolean) => {
  switch (status) {
    case ROSTER_STATUS.PENDING:
      return "bg-orange-50 border-orange-200 hover:bg-orange-100";
    case ROSTER_STATUS.SCHEDULED:
      return `bg-green-50 border-green-200 ${canEdit && "hover:bg-green-100"}`;
    case ROSTER_STATUS.FINISHED:
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-slate-50 border-slate-200 hover:bg-slate-100";
  }
};

const getBadgeStyle = (status: string) => {
  switch (status) {
    case ROSTER_STATUS.PENDING:
      return "bg-orange-100 text-orange-800";
    case ROSTER_STATUS.SCHEDULED:
      return "bg-green-100 text-green-800";
    case ROSTER_STATUS.FINISHED:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-grey-100 text-grey-800";
  }
};

function AssignmentInfo({
  name,
  startTime,
  endTime,
}: {
  name: string;
  startTime: string;
  endTime: string;
}) {
  return (
    <div className="text-xs">
      <div className="font-medium text-foreground truncate">{name}</div>
      <div className="text-muted-foreground">
        {startTime} - {endTime}
      </div>
    </div>
  );
}

interface AssignmentItemProps {
  isSaving: boolean;
  assignment: EmployeeAssignment;
  statusSchedule: string;
  // eslint-disable-next-line no-unused-vars
  onToggleStatus: (rosterId: number) => void;
  // eslint-disable-next-line no-unused-vars
  onEditAssignment: (rosterId: number) => void;
  // eslint-disable-next-line no-unused-vars
  onRemoveAssignment: (rosterId: number) => void;
}

export function AssignmentItem({
  isSaving,
  assignment,
  statusSchedule,
  onToggleStatus: handleStatusToggle,
  onEditAssignment: handleEditAssignment,
  onRemoveAssignment: handleRemoveAssignment,
}: AssignmentItemProps) {
  const canEdit =
    (assignment.status === ROSTER_STATUS.PENDING ||
      assignment.status === ROSTER_STATUS.SCHEDULED) &&
    statusSchedule === SCHEDULE_STATUS.DRAFT;
  const backgroundStyle = getBackgroundStyle(assignment.status, canEdit);
  const badgeStyle = getBadgeStyle(assignment.status);

  return (
    <div
      key={assignment.rosterId}
      className={`flex items-center gap-2 p-2 rounded border transition-colors ${backgroundStyle}`}
    >
      {isSaving ? (
        <div className="flex-1 min-w-0">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            {assignment.status === ROSTER_STATUS.FINISHED ? (
              <AssignmentInfo
                name={assignment.employeeName}
                startTime={assignment.startTime}
                endTime={assignment.endTime}
              />
            ) : (
              <button
                onClick={() => handleStatusToggle(assignment.rosterId)}
                className="w-full text-left hover:opacity-80 transition-opacity"
              >
                <AssignmentInfo
                  name={assignment.employeeName}
                  startTime={assignment.startTime}
                  endTime={assignment.endTime}
                />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {assignment.mode === ROSTER_MODE.ASSIGNED && (
              <Badge className={`text-xs ${badgeStyle}`}>F</Badge>
            )}
            {canEdit && (
              <>
                <button
                  onClick={() => handleEditAssignment(assignment.rosterId)}
                  className="p-1 hover:bg-yellow-100 rounded transition-colors"
                  title="Edit time range"
                >
                  <Edit2 className="h-3 w-3 text-yellow-600" />
                </button>
                <button
                  onClick={() => handleRemoveAssignment(assignment.rosterId)}
                  className="p-1 hover:bg-red-100 rounded transition-colors"
                  title="Remove assignment"
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
