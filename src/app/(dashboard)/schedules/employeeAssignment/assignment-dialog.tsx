import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAssignment } from "@/features/roster/types/roster.types";
import { TimeRange } from "@/lib/utils/dateTimeHelpers";
import { useState } from "react";

interface EmployeeTimeDialogProps {
  isSaving: boolean;
  assignment: EmployeeAssignment;
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  onSave: (updates: TimeRange) => void;
  onCancel: () => void;
}

export function AssignmentDialog({
  isSaving,
  assignment,
  isOpen,
  onOpenChange,
  onSave,
  onCancel,
}: EmployeeTimeDialogProps) {
  const [editStartTime, setEditStartTime] = useState<string>(
    assignment.startTime
  );
  const [editEndTime, setEditEndTime] = useState<string>(assignment.endTime);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {assignment.employeeName}&apos;s Time Ranges
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isSaving ? (
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-full w-full rounded-xl" />
            </div>
          ) : (
            <div className="space-y-2 p-3 gap-2 border border-border rounded">
              <div>
                <label className="text-xs font-medium">Start</label>
                <Input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">End</label>
                <Input
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({ startTime: editStartTime, endTime: editEndTime })
            }
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
