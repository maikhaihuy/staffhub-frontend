import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Employee } from "@/features/employee/types";
import { create, remove, update } from "@/features/employee/api";

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employee: Employee) => create(employee),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    }
  })
}

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({employeeId, employee}: {employeeId: number, employee: Employee}) => update(+employeeId, employee),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    }
  })
}

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeId: number) => remove(+employeeId),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    }
  })
}
