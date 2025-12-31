import { create, remove, update } from "@/features/shift/services/shift.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shift } from "@/features/shift/types/shift.types";

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shift: Shift) => create(shift),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
    }
  })
}

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (shift: Shift) => update(shift.id, shift),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
    }
  })
}

export const useDeleteShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] })
    }
  })
}
