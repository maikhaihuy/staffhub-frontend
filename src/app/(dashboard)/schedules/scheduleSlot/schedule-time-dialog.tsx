import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface EmployeeTimeDialogProps {
  isSaving: boolean,
  startTime: string,
  endTime: string,
  maxSlots: number,
  isOpen: boolean,
  // eslint-disable-next-line no-unused-vars
  onOpenChange: (open: boolean) => void,
  // eslint-disable-next-line no-unused-vars
  onSave: (updates: {startTime: string, endTime: string, maxSlots: number}) => void,
  onCancel: () => void,
}

export function SchduleTimeDialog({isSaving, startTime, endTime, maxSlots, isOpen, onOpenChange, onSave, onCancel}: EmployeeTimeDialogProps) {
  const [editStartTime, setEditStartTime] = useState(startTime);
  const [editEndTime, setEditEndTime] = useState(endTime);
  const [editMaxSlots, setEditMaxSlots] = useState(maxSlots);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift Times</DialogTitle>
        </DialogHeader>
        {isSaving ?
        (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        )
        :
        (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Start Time</label>
              <Input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Time</label>
              <Input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Slots</label>
              <Input
                type="number"
                min="1"
                value={editMaxSlots}
                onChange={(e) => setEditMaxSlots(Number.parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button disabled={isSaving} variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={isSaving} onClick={() => {
            console.log('saveeeee');
            onSave({startTime: editStartTime, endTime: editEndTime, maxSlots: editMaxSlots})
          }}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}