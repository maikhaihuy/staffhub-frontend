import { Roster } from "@/features/roster/types/roster.types";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AssignmentDialog({
  roster,
  isOpen,
  onClose,
  onSave,
}: {
  roster: Roster;
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void,
  // eslint-disable-next-line no-unused-vars
  onSave: (updates: {startTime: string, endTime: string}) => void,
  onClose: () => void;
}) {
  const [editStartTime, setEditStartTime] = useState(getTime(roster.actualStartAt));
  const [editEndTime, setEditEndTime] = useState(getTime(roster.actualEndAt));
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{roster.id ? "Edit Registration" : "Register for Shift"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Shift name
            </p>
            <p className="text-sm font-medium text-foreground">
              Default: {getTime(roster.actualStartAt)} - {getTime(roster.actualEndAt)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Start Time (optional)</Label>
            <Input
              type="time"
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>End Time (optional)</Label>
            <Input
              type="time"
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave({startTime: editStartTime, endTime: editEndTime})}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
