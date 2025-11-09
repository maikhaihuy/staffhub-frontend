import { AssignmentDialog } from "./assignment-dialog";
import { AssignmentItem } from "./assignment-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ROSTER_MODE, ROSTER_STATUS, SCHEDULE_STATUS } from "@/constants";
import { Employee } from "@/features/employee/types";
import { create, remove, schedule, update } from "@/features/roster/api";
import { EmployeeAssignment, Roster } from "@/features/roster/types";
import { ScheduleSlot } from "@/features/schedule/types";
import {
  combineDateTime,
  getTime,
  getTimeFromString,
} from "@/utils/dateTimeHelpers";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AssignmentListProp {
  slot: ScheduleSlot;
  employees: Employee[];
  isSaving: boolean;
  // eslint-disable-next-line no-unused-vars
  onUpdate: (updatedSlot: ScheduleSlot) => void;
}

function EmployeeSelect({
  scheduleId,
  employees,
  onClickAddAssignment,
}: {
  scheduleId: number;
  employees: Employee[];
  // eslint-disable-next-line no-unused-vars
  onClickAddAssignment: (scheduleId: number, employeeId: number) => void;
}) {
  return (
    <Select onValueChange={(value) => onClickAddAssignment(scheduleId, +value)}>
      <SelectTrigger className="w-full h-8 text-xs">
        <SelectValue placeholder="Add employee" />
      </SelectTrigger>
      <SelectContent>
        {employees.map((emp) => (
          <SelectItem key={emp.id} value={emp.id.toString()}>
            {emp.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function AssignmentList({
  isSaving,
  slot,
  employees,
  onUpdate,
}: AssignmentListProp) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<EmployeeAssignment | null>(null);
  const [savingAssignmentId, setSavingAssignment] = useState<number>(0);
  const [isEditingEmployeeTime, setIsEditingEmployeeTime] = useState(false);

  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: (roster: Roster) => create(roster),
    onSuccess: async (newRoster) => {
      const employee = employees.find((e) => e.id === newRoster.employeeId);
      const newAssignments = [
        ...slot.assignments,
        {
          rosterId: newRoster.id,
          employeeId: newRoster.employeeId,
          employeeName: employee ? employee.name : "",
          scheduleId: newRoster.scheduleId,
          startTime: getTime(newRoster.actualStartAt),
          endTime: getTime(newRoster.actualEndAt),
          status: newRoster.status,
          mode: newRoster.mode,
        },
      ] as EmployeeAssignment[];
      onUpdate({
        ...slot,
        assignments: newAssignments,
      } as ScheduleSlot);
    },
  });

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: (roster: Roster) => update(roster.id, roster),
    onSuccess: async (newRoster) => {
      const employee = employees.find((e) => e.id === newRoster.employeeId);
      const newAssignments = slot.assignments.map((a) => {
        if (a.rosterId === newRoster.id) {
          return {
            rosterId: newRoster.id,
            employeeId: newRoster.employeeId,
            employeeName: employee ? employee.name : "",
            scheduleId: slot.scheduleId,
            startTime: getTime(newRoster.actualStartAt),
            endTime: getTime(newRoster.actualEndAt),
            status: newRoster.status,
            mode: newRoster.mode,
          } as EmployeeAssignment;
        }
        return a;
      });
      onUpdate({
        ...slot,
        assignments: newAssignments,
      } as ScheduleSlot);
      // reset editing state
      setIsEditingEmployeeTime(false);
      setSelectedAssignment(null);
    },
  });

  const { mutate: scheduleMutate, isPending: isScheduling } = useMutation({
    mutationFn: (rosterId: number) => schedule(rosterId),
    onSuccess: async (newRoster) => {
      const employee = employees.find((e) => e.id === newRoster.employeeId);
      const newAssignments = slot.assignments.map((a) => {
        if (a.rosterId === newRoster.id) {
          return {
            rosterId: newRoster.id,
            employeeId: newRoster.employeeId,
            employeeName: employee ? employee.name : "",
            scheduleId: slot.scheduleId,
            startTime: getTime(newRoster.actualStartAt),
            endTime: getTime(newRoster.actualEndAt),
            status: newRoster.status,
            mode: newRoster.mode,
          } as EmployeeAssignment;
        }
        return a;
      });
      onUpdate({
        ...slot,
        assignments: newAssignments,
      } as ScheduleSlot);
      // reset saving assignment id
      setSavingAssignment(0);
    },
  });

  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: (rosterId: number) => remove(rosterId),
    onSuccess: async (data) => {
      const newAssignments = slot.assignments.reduce((acc, assignment) => {
        if (assignment.rosterId !== data) {
          acc.push(assignment);
        }
        return acc;
      }, [] as EmployeeAssignment[]);
      onUpdate({
        ...slot,
        assignments: newAssignments,
      } as ScheduleSlot);
    },
  });

  useEffect(() => {
    setIsLoading(isCreating || isDeleting);
  }, [isCreating, isDeleting]);

  const assignedEmployeeIds = slot.assignments.map((a) => a.employeeId);
  const availableEmployees = employees.filter(
    (emp) => !assignedEmployeeIds.includes(emp.id)
  );

  const handleAddAssignment = (scheduleId: number, employeeId: number) => {
    const addtartTime = combineDateTime(
      slot.date,
      getTimeFromString(slot.startTime)
    );
    const addEndTime = combineDateTime(
      slot.date,
      getTimeFromString(slot.endTime)
    );

    const newRoster: Roster = {
      id: 0, // will be set by backend
      scheduleId: scheduleId,
      employeeId: employeeId,
      actualDate: slot.date,
      actualStartAt: addtartTime,
      actualEndAt: addEndTime,
      status: ROSTER_STATUS.PENDING,
      mode: ROSTER_MODE.ASSIGNED,
      note: "",
    };
    createMutate(newRoster);
  };

  const handleToggleStatus = (rosterId: number) => {
    setSavingAssignment(rosterId);
    scheduleMutate(rosterId);
  };

  const handleEditAssignment = (rosterId: number) => {
    const assignment = slot.assignments.find((a) => a.rosterId === rosterId);
    if (!assignment) return;

    setSelectedAssignment(assignment);
    setIsEditingEmployeeTime(true);
  };

  const handleRemoveAssignment = (rosterId: number) => {
    deleteMutate(rosterId);
  };

  const handleSaveEmployeeTime = (startTime: string, endTime: string) => {
    if (!selectedAssignment) return;

    const editStartTime = combineDateTime(
      slot.date,
      getTimeFromString(startTime)
    );
    const editEndTime = combineDateTime(slot.date, getTimeFromString(endTime));
    if (editStartTime >= editEndTime) {
      toast.error("Start time must be before end time");
      return;
    }

    const updatedRoster: Roster = {
      id: selectedAssignment.rosterId,
      scheduleId: selectedAssignment.scheduleId,
      employeeId: selectedAssignment.employeeId,
      actualDate: slot.date,
      actualStartAt: editStartTime,
      actualEndAt: editEndTime,
      status: selectedAssignment.status,
      mode: selectedAssignment.mode,
      note: "",
    };

    updateMutate(updatedRoster);
  };

  return isSaving || isLoading ? (
    <SkeletonCard />
  ) : (
    <>
      {/* Assigned employees */}
      <div className="space-y-1 mb-3">
        {slot.assignments
          .filter((a) => a.status !== ROSTER_STATUS.REJECTED)
          .filter((a) =>
            slot.status === SCHEDULE_STATUS.PUBLISHED
              ? a.status === ROSTER_STATUS.SCHEDULED
              : true
          )
          .map((assignment) => {
            return (
              <AssignmentItem
                key={assignment.rosterId}
                isSaving={
                  assignment.rosterId === savingAssignmentId &&
                  (isUpdating || isScheduling)
                }
                assignment={assignment}
                statusSchedule={slot.status}
                onToggleStatus={handleToggleStatus}
                onEditAssignment={handleEditAssignment}
                onRemoveAssignment={handleRemoveAssignment}
              />
            );
          })}
      </div>

      {/* Add employee dropdown - only show if not fully staffed */}
      {slot.status === SCHEDULE_STATUS.DRAFT && (
        <div className="w-full">
          <EmployeeSelect
            scheduleId={slot.scheduleId}
            employees={availableEmployees}
            onClickAddAssignment={(scheduleId, employeeId) =>
              handleAddAssignment(scheduleId, employeeId)
            }
          />
        </div>
      )}

      {/* Edit employee time ranges modal */}
      {selectedAssignment && (
        <AssignmentDialog
          isSaving={isUpdating}
          assignment={selectedAssignment}
          isOpen={isEditingEmployeeTime}
          onOpenChange={setIsEditingEmployeeTime}
          onCancel={() => setIsEditingEmployeeTime(false)}
          onSave={({ startTime, endTime }) =>
            handleSaveEmployeeTime(startTime, endTime)
          }
        />
      )}
    </>
  );
}
