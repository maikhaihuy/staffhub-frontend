import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Assignment } from "@/features/assignment/types";
import {
  useCheckInAssignment,
  useCheckOutAssignment,
} from "@/features/assignment/hooks/useAssignmentMutations";
import { TaskTemplate } from "@/features/taskTemplate/types";
import { getTime } from "@/lib/utils/dateTimeHelpers";
import { CheckCircle2, Circle, ListChecks } from "lucide-react";

interface TodayShiftCardProps {
  assignment: Assignment;
  branchName: string;
  taskTemplates: TaskTemplate[];
}

export function TodayShiftCard({ assignment, branchName, taskTemplates }: TodayShiftCardProps) {
  const checkIn = useCheckInAssignment();
  const checkOut = useCheckOutAssignment();

  const isCheckedIn = !!assignment.actualStartTime;
  const isCheckedOut = !!assignment.actualEndTime;

  const mandatoryTasks = taskTemplates.filter((t) => t.type === "SHARED_MANDATORY");
  const todoTasks = taskTemplates.filter((t) => t.type === "SHARED_OPTIONAL");

  const statusLabel = isCheckedOut ? "Đã kết ca" : isCheckedIn ? "Đang trong ca" : "Chưa vào ca";
  const statusVariant = isCheckedOut ? "secondary" : isCheckedIn ? "default" : "outline";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{assignment.subShift?.title ?? "Ca làm việc"}</CardTitle>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {branchName}
          {assignment.subShift && (
            <>
              {" · "}
              {getTime(new Date(assignment.subShift.startTime))} -{" "}
              {getTime(new Date(assignment.subShift.endTime))}
            </>
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckedIn && (
          <p className="text-sm text-muted-foreground">
            Vào ca lúc {getTime(new Date(assignment.actualStartTime!))}
            {isCheckedOut && ` · Kết ca lúc ${getTime(new Date(assignment.actualEndTime!))}`}
          </p>
        )}

        <div className="flex gap-2">
          {!isCheckedIn && (
            <Button
              onClick={() => checkIn.mutate({ id: assignment.id, data: {} })}
              disabled={checkIn.isPending}
            >
              Vào ca
            </Button>
          )}
          {isCheckedIn && !isCheckedOut && (
            <Button
              variant="outline"
              onClick={() => checkOut.mutate({ id: assignment.id, data: {} })}
              disabled={checkOut.isPending}
            >
              Kết ca
            </Button>
          )}
        </div>

        {(mandatoryTasks.length > 0 || todoTasks.length > 0) && (
          <div className="space-y-2 border-t border-border pt-3">
            {mandatoryTasks.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                  <ListChecks className="h-3.5 w-3.5" /> Nhiệm vụ bắt buộc
                </p>
                <ul className="space-y-1">
                  {mandatoryTasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-1.5 text-sm">
                      <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {todoTasks.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Việc cần làm
                </p>
                <ul className="space-y-1">
                  {todoTasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-1.5 text-sm">
                      <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
