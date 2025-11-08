import AssignmentDialog from "./assignment-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROSTER_STATUS } from "@/constants";
import { Roster } from "@/features/roster/types";
import { useCreateRoster, useDeleteRoster, useUpdateRoster } from "@/hooks/useRosters";
import {
  combineDateTime,
  getTime,
  getTimeFromString,
} from "@/utils/dateTimeHelpers";
import { ClockAlert, ClockCheck, ClockPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const getStatusColor = (status: string) => {
  switch (status) {
    case ROSTER_STATUS.PENDING:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case ROSTER_STATUS.SCHEDULED:
      return "bg-green-100 text-green-800 border-green-200";
    case ROSTER_STATUS.FINISHED:
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case ROSTER_STATUS.PENDING:
      return <ClockAlert className="h-3 w-3" />;
    case ROSTER_STATUS.SCHEDULED:
      return <ClockCheck className="h-3 w-3" />;
    case ROSTER_STATUS.FINISHED:
      return <XCircle className="h-3 w-3" />;
    default:
      return <ClockPlus className="h-3 w-3" />;
  }
};

export default function AssignmentItem({ roster }: { roster: Roster }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const canEdit =
    roster.status === ROSTER_STATUS.PENDING || roster.status === "";
  const isNew = roster.id === 0;

  //#region mutation
  const { mutate: mutateRoster } = useCreateRoster();
  const { mutate: updateRoster } = useUpdateRoster();
  const { mutate: removeRoster } = useDeleteRoster();
  //#endregion

  //#region handlers
  const handleRegister = (roster: Roster) => {
    // if (slot.status !== "Draft") {
    //   toast.error("Can only register for Draft slots")
    //   return
    // }
    // setEditingSlot(slot)
    // setCustomTimes({ startTime: slot.startTime, endTime: slot.endTime })
    // setIsDialogOpen(true)
    console.log(roster);
    mutateRoster(roster, {
      onSuccess: async (data) => {
      console.log(data);
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error("Failed to register roster");
    },
    });
  };

  const handleUnregister = (roster: Roster) => {
    console.log(roster);
    removeRoster(roster.id, {
      onSuccess: async (data) => {
      console.log(data);
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error("Failed to unregister roster");
    },
    });
  };

  const handleUpdateAssignmentTime = (
    roster: Roster,
    updates: { startTime: string; endTime: string }
  ) => {
    // if (slot.status !== "Draft" || !slot.assignment) {
    //   toast.error("Can only edit Pending registrations in Draft slots")
    //   return
    // }
    // setEditingSlot(slot)
    // setCustomTimes({
    //   startTime: slot.assignment.customStartTime || slot.startTime,
    //   endTime: slot.assignment.customEndTime || slot.endTime,
    // })
    // setIsDialogOpen(true)

    console.log(roster);
    const editStartTime = combineDateTime(
      roster.actualStartAt,
      getTimeFromString(updates.startTime)
    );
    const editEndTime = combineDateTime(
      roster.actualEndAt,
      getTimeFromString(updates.endTime)
    );
    updateRoster({
      ...roster,
      actualStartAt: editStartTime,
      actualEndAt: editEndTime,
    }, {
      onSuccess: async (data: Roster) => {
      console.log(data);
    },
    onError: (error: Error) => {
      console.error(error);
      toast.error("Failed to update roster");
    },
    });
  };
  //#endregion

  return (
    <div className="space-y-2 flex flex-col justify-center">
      <Badge
        className={`w-full flex-row justify-center gap-1 p-2 ${getStatusColor(
          roster.status
        )}`}
      >
        {getStatusIcon(roster.status)}
        <span className="">
          {getTime(roster.actualStartAt)} - {getTime(roster.actualEndAt)}
        </span>
      </Badge>
      <div className="w-full flex flex-row justify-center gap-2">
        {canEdit ? (
          isNew ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRegister(roster)}
              className="w-full"
            >
              Register
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUnregister(roster)}
                className="flex-1"
              >
                Unregister
              </Button>
            </>
          )
        ) : (
          <div className="text-md text-muted-foreground text-center py-1 px-2">
            {roster.status} - View only
          </div>
        )}
      </div>
      {isDialogOpen && (
        <AssignmentDialog
          roster={roster}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={(updates) => {
            console.log(updates);
            handleUpdateAssignmentTime(roster, updates);
          }}
          onOpenChange={(open: boolean) => setIsDialogOpen(open)}
        />
      )}
    </div>
  );
}
