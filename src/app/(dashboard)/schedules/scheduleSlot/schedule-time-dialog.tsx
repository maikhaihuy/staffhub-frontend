import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

interface EmployeeTimeDialogProps {
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

export function SchduleTimeDialog({startTime, endTime, maxSlots, isOpen, onOpenChange, onSave, onCancel}: EmployeeTimeDialogProps) {
  const [editStartTime, setEditStartTime] = useState(startTime);
  const [editEndTime, setEditEndTime] = useState(endTime);
  const [editMaxSlots, setEditMaxSlots] = useState(maxSlots);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shift Times</DialogTitle>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onSave({startTime: editStartTime, endTime: editEndTime, maxSlots: editMaxSlots})}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}