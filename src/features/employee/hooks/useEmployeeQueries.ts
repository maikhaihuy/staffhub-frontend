import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { employeeService } from "@/features/employee/services/employee.service";
import { Employee } from "@/features/employee/types";

export const useGetEmployees = () =>
  useAppQuery<Employee[]>(queryKeys.employees.all(), employeeService.list);

export const useGetEmployee = (employeeId: number) =>
  useAppQuery<Employee>(
    queryKeys.employees.detail(employeeId),
    () => employeeService.getById(employeeId),
    { enabled: !!employeeId }
  );
