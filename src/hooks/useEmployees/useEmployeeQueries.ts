import { getEmployee, getEmployees, getEmployeesByBranch, getEmployeesWithAccount } from "@/features/employee/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";


export const useGetEmployees = () =>
  useQuery({
    queryKey: queryKeys.employees.all(),
    queryFn: () => getEmployees(),
  });

export const useGetEmployeesByBranch = (branchId: number) =>
  useQuery({
    queryKey: queryKeys.employees.byBranch(branchId),
    queryFn: () => getEmployeesByBranch(+branchId),
    enabled: !!branchId,
  });

export const useGetEmployeesWithAccount = () =>
  useQuery({
    queryKey: queryKeys.employees.withAccount(),
    queryFn: ({queryKey}) => {
      const [, , branchId] = queryKey;
      return getEmployeesWithAccount(+branchId);
    },
    enabled: false,
  });

export const useGetEmployee = (employeeId: number) =>
  useQuery({
    queryKey: queryKeys.employees.detail(employeeId),
    queryFn: () => getEmployee(employeeId),
    enabled: !!employeeId,
  });
