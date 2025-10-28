import { Employee } from "@/features/employee/types";
import { ScheduleSlot } from "@/features/schedule/types";
import { Edit2, X } from "lucide-react";

interface AssignmentListProp {
  slot: ScheduleSlot,
  employees: Employee[],
  // eslint-disable-next-line no-unused-vars
  onClickAddAssignment(employeeId: number): void,
  // eslint-disable-next-line no-unused-vars
  onClickEditAssignment(employeeId: number): void,
  // eslint-disable-next-line no-unused-vars
  onClickRemoveAssignment(employeeId: number): void,

}
export function AssignmentList({slot, employees, onClickAddAssignment, onClickEditAssignment, onClickRemoveAssignment}: AssignmentListProp) {
  const assignedEmployeeIds = slot.assignments.map((a) => a.employeeId);
  const isFullyStaffed = assignedEmployeeIds.length === slot.maxSlots
  const availableEmployees = employees.filter((emp) => !assignedEmployeeIds.includes(emp.id));
  return (
    <>
      {/* Assigned employees */}
      <div className="space-y-1">
      {slot.assignments.map((assignment) => {
        const employee = employees.find((e) => e.id === assignment.employeeId)
        if (!employee) return null

        return (
          <div
            key={assignment.employeeId}
            className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-xs group"
          >
            <div className="flex-1">
              <div className="font-medium text-blue-900">{employee.name}</div>
              {assignment.startTime && assignment.endTime && (
                <div className="text-blue-700 text-xs mt-0.5">
                  {assignment.startTime} - {assignment.endTime}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onClickEditAssignment(assignment.employeeId)}
                className="text-blue-600 hover:text-blue-800 p-0.5"
                disabled={slot.isSaving}
                title="Edit time range"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => onClickRemoveAssignment(assignment.employeeId)}
                className="text-blue-600 hover:text-blue-800 p-0.5"
                disabled={slot.isSaving}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )
      })}
    </div>

    {/* Add employee dropdown - only show if not fully staffed */}
    {!isFullyStaffed && availableEmployees.length > 0 && (
      <select
        className="w-full text-xs border border-border rounded px-2 py-1.5 bg-background"
        value=""
        onChange={(e) => {
          if (e.target.value) {
            onClickAddAssignment(Number.parseInt(e.target.value))
          }
        }}
        disabled={slot.isSaving}
      >
        <option value="">+ Add Employee</option>
        {availableEmployees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.name}
          </option>
        ))}
      </select>
    )}

    {/* Staffing indicator */}
    <div className="text-xs text-center">
      <span className={`font-medium ${isFullyStaffed ? "text-green-600" : "text-orange-600"}`}>
        {assignedEmployeeIds.length}/{slot.maxSlots}
      </span>
    </div>
  </>
  );
}