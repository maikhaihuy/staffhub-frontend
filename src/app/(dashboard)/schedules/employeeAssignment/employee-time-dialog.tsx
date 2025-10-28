
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TimeRange } from "@/utils/dateTimeHelpers";
import { useState } from "react";

interface EmployeeTimeDialogProps {
  nameEmployee: string
  timeRange: TimeRange
  isOpen: boolean
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void
  // eslint-disable-next-line no-unused-vars
  onSave: (updates: TimeRange) => void
  onCancel: () => void
}

export function EmployeeTimeDialog({ nameEmployee, timeRange, isOpen, onOpenChange, onSave, onCancel }: EmployeeTimeDialogProps) {
  const [editStartTime, setEditStartTime] = useState<string>(timeRange.startTime)
  const [editEndTime, setEditEndTime] = useState<string>(timeRange.endTime)

  // Re-sync local state when dialog opens or input props change
  // useEffect(() => {
  //   if (isOpen) {
  //     setEditStartTime(timeRange.startTime)
  //     setEditEndTime(timeRange.endTime)
  //   }
  // }, [isOpen, timeRange])
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {nameEmployee}&apos;s Time Ranges</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="space-y-2 p-3 border border-border rounded">
              <div className="grid grid-cols-2 gap-2">
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
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave({ startTime: editStartTime, endTime: editEndTime })}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
