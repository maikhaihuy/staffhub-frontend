import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SCHEDULE_STATUS } from "@/constants";
import { Banknote, BanknoteX, EyeOff, Globe } from "lucide-react";

interface ScheduleStatusButtonProps {
  isSaving: boolean;
  status: string;
  onClick: () => void;
}
export function ScheduleStatusButton({isSaving, status, onClick}: ScheduleStatusButtonProps) {
  return (
    <div className="flex gap-2 pt-2 border-t border-border">
      {status === SCHEDULE_STATUS.DRAFT && (
        <Button
          onClick={onClick}
          disabled={isSaving}
          size="sm"
          className="w-full text-xs font-medium rounded transition-colors bg-emerald-600 text-white hover:bg-emerald-700 hover:text-emerald-100 "
          variant="default"
        >
          {isSaving ? (
            <>
              <Spinner className="mr-1" /> Publishing...
            </>
          ) : (
            <>
              <Globe className="mr-1" /> Publish
            </>
          )}
        </Button>
      )}

      {status === SCHEDULE_STATUS.PUBLISHED && (
        <Button
        onClick={onClick}
        disabled={isSaving}
        size="sm"
        className="w-full text-xs font-medium rounded transition-colors bg-amber-600 text-white hover:bg-amber-700 hover:text-amber-100"
        variant="default"
      >
        {isSaving ? (
            <>
              <Spinner className="mr-1" /> Unpublishing...
            </>
          ) : (
            <>
              <EyeOff className="mr-1" /> Unpublish
            </>
          )}
      </Button>
      )}

      {status === SCHEDULE_STATUS.LOCKED && (
        <Button
        size="sm"
        className="w-full text-xs font-medium rounded transition-colors border-indigo-600 bg-indigo-200 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-700"
        variant="outline"
      >
        <>
          <BanknoteX className="mr-1" /> Locked
        </>
      </Button>
      )}

      {status === SCHEDULE_STATUS.COMPLETED && (
        <Button
        size="sm"
        className="w-full text-xs font-medium rounded transition-colors border-indigo-600 bg-indigo-200 hover:bg-indigo-200 text-indigo-700 hover:text-indigo-700"
        variant="outline"
      >
        <>
          <Banknote className="mr-1" /> Complelted
        </>
      </Button>
      )}
    </div>
  );  
}
