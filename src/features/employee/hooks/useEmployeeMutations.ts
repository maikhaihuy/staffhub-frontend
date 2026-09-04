import { toast } from "sonner";
import { FormErrorSetter, useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeInput,
  SelfUpdateEmployeeDTO,
} from "@/features/employee/types";
import { employeeService, updateMyProfile } from "@/features/employee/services/employee.service";

export const useCreateEmployee = (form?: FormErrorSetter) =>
  useAppMutation<Employee, CreateEmployeeDTO>((data) => employeeService.create(data), {
    invalidateKey: queryKeys.employees.all(),
    onSuccess: () => {
      // Employee creation also auto-provisions a login account with a
      // backend-generated one-time password (returned as
      // `temporaryPassword` on the response, shown for copying by the
      // caller) - not the employee's phone number. Confirmed live against
      // staffhub-backend's employee.service.ts (generateOneTimeCredential()).
      toast.success(
        "Đã tạo nhân viên. Một mật khẩu tạm thời đã được tạo cho tài khoản đăng nhập — vui lòng sao chép và gửi cho nhân viên.",
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

export const useUpdateMyProfile = (form?: FormErrorSetter) =>
  useAppMutation<Employee, SelfUpdateEmployeeDTO>((data) => updateMyProfile(data), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Đã cập nhật thông tin cá nhân",
    form,
  });

export const useDeleteEmployee = () =>
  useAppMutation<void, number>((id) => employeeService.remove(id), {
    invalidateKey: queryKeys.employees.all(),
    successMessage: "Employee deleted",
  });
