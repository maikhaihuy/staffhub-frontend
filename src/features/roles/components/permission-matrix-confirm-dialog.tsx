"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type MatrixChange = {
  permissionId: number;
  action: string;
  subject: string;
  beforeLabel: string;
  afterLabel: string;
};

type PermissionMatrixConfirmDialogProps = {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
  changes: MatrixChange[];
  affectedUserCount: number;
  onConfirm: () => void | Promise<void>;
  isSubmitting: boolean;
};

export default function PermissionMatrixConfirmDialog({
  open,
  setOpen,
  changes,
  affectedUserCount,
  onConfirm,
  isSubmitting,
}: PermissionMatrixConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm permission changes</DialogTitle>
          <DialogDescription>
            {affectedUserCount} user{affectedUserCount === 1 ? "" : "s"} currently
            hold this role and will be affected by this change.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto text-sm">
          {changes.map((change) => (
            <div
              key={change.permissionId}
              className="flex flex-col gap-0.5 border-b pb-2 last:border-b-0"
            >
              <div className="font-medium">
                {change.action}:{change.subject}
              </div>
              <div className="text-muted-foreground">
                {change.beforeLabel} → {change.afterLabel}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm()} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
