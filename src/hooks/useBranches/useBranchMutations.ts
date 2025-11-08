import { create, remove, update } from "@/features/branch/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Branch } from "@/features/branch/types";

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branch: Branch) => create(branch),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branch: Branch) => update(branch.id, branch),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}
