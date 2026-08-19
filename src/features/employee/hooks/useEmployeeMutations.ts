import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { Employee, CreateEmployeeDTO, UpdateEmployeeInput } from "@/features/employee/types";
import { employeeService } from "@/features/employee/services/employee.service";

export const useCreateEmployee = () =>
  useAppMutation<Employee, CreateEmployeeDTO>((data) => employeeService.create(data), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Employee created",
  });

export const useUpdateEmployee = () =>
  useAppMutation<Employee, UpdateEmployeeInput>(({ id, ...data }) => employeeService.update(id, data), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Employee updated",
  });

export const useDeleteEmployee = () =>
  useAppMutation<void, number>((id) => employeeService.remove(id), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Employee deleted",
  });
