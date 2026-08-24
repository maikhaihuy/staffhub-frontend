import { Card } from "@/components/ui/card";
import { SubShiftRow } from "./sub-shift-row";
import { MasterShift } from "@/features/masterShift/types";
import { SubShiftLite } from "@/features/subShift/types";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import { cn } from "@/lib/utils/cn";
import { Clock } from "lucide-react";

// MAIN slots first ordered by startTime, then SUPPORT slots ordered by
// startTime - mirrors the ordering already established for the
// master-shift-template timeline.
function orderSubShifts(subShifts: SubShiftLite[]) {
  const rank = (type: string) => (type === "MAIN" ? 0 : 1);
  return [...subShifts].sort((a, b) => {
    const rankDiff = rank(a.type) - rank(b.type);
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

interface MasterShiftCardProps {
  branchId: number;
  masterShift: MasterShift;
  accentColor: string;
}

export function MasterShiftCard({ branchId, masterShift, accentColor }: MasterShiftCardProps) {
  const subShifts = masterShift.subShifts ?? [];

  return (
    <Card className="py-0 gap-0 overflow-hidden">
      <div className={cn("border-l-4 px-4 py-3", accentColor)}>
        <div className="font-semibold text-sm text-foreground">{masterShift.title}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <Clock className="h-3 w-3" />
          {getTime(new Date(masterShift.startTime))} - {getTime(new Date(masterShift.endTime))}
        </div>
      </div>

      {subShifts.length === 0 ? (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          No sub-shifts configured for this template
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orderSubShifts(subShifts).map((subShift) => (
            <SubShiftRow key={subShift.id} branchId={branchId} subShift={subShift} />
          ))}
        </div>
      )}
    </Card>
  );
}
