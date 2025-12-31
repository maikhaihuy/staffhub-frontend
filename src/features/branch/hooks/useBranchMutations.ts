import { branchService } from "@/features/branch/services/branch.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Branch } from "@/features/branch/types/branch.types";

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branch: Branch) => branchService.create(branch),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branch: Branch) => branchService.update(branch.id, branch),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => branchService.remove(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}
