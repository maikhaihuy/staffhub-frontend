import { toast } from "sonner";
import { FormErrorSetter, useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { Employee, CreateEmployeeDTO, UpdateEmployeeInput } from "@/features/employee/types";
import { employeeService } from "@/features/employee/services/employee.service";

export const useCreateEmployee = (form?: FormErrorSetter) =>
  useAppMutation<Employee, CreateEmployeeDTO>((data) => employeeService.create(data), {
    invalidateKey: queryKeys.employees.all(),
    onSuccess: () => {
      // Employee creation also auto-provisions a login account (default
      // password = phone number, must be changed on first login) - tell the
      // Admin now, not just leave them to discover it when the employee asks.
      toast.success(
        "Đã tạo nhân viên. Tài khoản đăng nhập đã được tạo tự động với mật khẩu mặc định là số điện thoại của nhân viên — nhân viên sẽ được yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên.",
        { duration: 8000 }
      );
    },
    form,
  });

export const useUpdateEmployee = (form?: FormErrorSetter) =>
  useAppMutation<Employee, UpdateEmployeeInput>(({ id, ...data }) => employeeService.update(id, data), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Employee updated",
    form,
  });

export const useDeleteEmployee = () =>
  useAppMutation<void, number>((id) => employeeService.remove(id), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Employee deleted",
  });
