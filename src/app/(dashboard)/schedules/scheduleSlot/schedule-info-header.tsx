import { SCHEDULE_STATUS } from "@/constants";
import { ScheduleSlot } from "@/features/schedule/types/schedule.types";
import { Clock, Edit2, Users, Lock, Globe, CalendarPlus2 } from "lucide-react";

interface ScheduleInfoHeaderProps {
  isSaving: boolean;
  slot: ScheduleSlot;
  // eslint-disable-next-line no-unused-vars
  onOpenChange(isOpen: boolean): void;
}

const getIconStatus = (status: string) => {
  switch(status) {
    case SCHEDULE_STATUS.DRAFT:
      return <Edit2 className="h-4 w-4 text-orange-500" />;
    case SCHEDULE_STATUS.PUBLISHED:
      return <Globe className="h-4 w-4 text-green-500" />;
    case SCHEDULE_STATUS.LOCKED:
    case SCHEDULE_STATUS.COMPLETED:
      return <Lock className="h-4 w-4 text-blue-500" />;
    default:
      return <CalendarPlus2 className="h-4 w-4 text-slate-500" />;
  }
}

const getBackgroundStyle = (status: string, canEdit: boolean) => {
  switch(status) {
    case SCHEDULE_STATUS.DRAFT:
      return `bg-orange-50 border-orange-200 ${canEdit && "hover:bg-orange-100"}`;
    case SCHEDULE_STATUS.PUBLISHED:
      return "bg-green-50 border-green-200";
    case SCHEDULE_STATUS.LOCKED:
    case SCHEDULE_STATUS.COMPLETED:
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-slate-50 border-slate-200 hover:bg-slate-100 ";
  }
}

const getColorSlots = (cur: number, max: number) => {
  if (cur < max) {
    return "text-orange-600";
  } else if (cur > max) {
    return "text-green-600";
  }
  return "text-muted-foreground";
}

export function ScheduleInfoHeader({ isSaving, slot, onOpenChange}: ScheduleInfoHeaderProps) {
  const backgroundStyle = getBackgroundStyle(slot.status, !isSaving);
  const iconStatus = getIconStatus(slot.status);
  const curMaxSlots = slot.assignments.length;
  const colorSlots = getColorSlots(curMaxSlots, slot.maxSlots);

  return (
    <div className="space-y-2">
      <button
        onClick={() => onOpenChange(true)}
        className={`w-full flex items-center justify-between border rounded px-2 py-1.5 text-xs transition-colors ${backgroundStyle}`}
        disabled={isSaving || slot.status !== SCHEDULE_STATUS.DRAFT}
      >
        {/* Left side: Time range */}
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="text-sm font-medium text-foreground">
            {slot.startTime} – {slot.endTime}
          </div>
        </div>

        {/* Middle: Slot count */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className={`text-sm text-muted-foreground ${colorSlots}`}>
            {curMaxSlots}/{slot.maxSlots}
          </span>
        </div>
        {/* Right: Status icon */}
        {iconStatus}
      </button>
    </div>
  );
}
