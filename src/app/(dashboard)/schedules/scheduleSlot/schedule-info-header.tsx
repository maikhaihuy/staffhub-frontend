import { Clock, Edit2, Users } from "lucide-react";

interface ScheduleInfoHeaderProps {
  isSaving: boolean;
  startTime: string;
  endTime: string;
  maxSlots: number;
  // eslint-disable-next-line no-unused-vars
  onOpenChange(isOpen: boolean): void;
}
export function ScheduleInfoHeader({isSaving, startTime, endTime, maxSlots, onOpenChange}: ScheduleInfoHeaderProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={() => onOpenChange(true)}
        className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs transition-colors"
        disabled={isSaving}
      >
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-600" />
          <span className="font-medium text-slate-700">
            {startTime} - {endTime}
          </span>
        
          <Users className="h-3 w-3 text-slate-600" />
          <span className="font-medium text-slate-700">
          {maxSlots}
          </span>
        </div>
        <Edit2 className="h-3 w-3 text-slate-500" />
      </button>
    </div>
  );
}
