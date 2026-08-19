import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { Branch, CreateBranchDTO, UpdateBranchInput } from "@/features/branch/types";
import { branchService } from "../services/branch.service";

export const useCreateBranch = () =>
  useAppMutation<Branch, CreateBranchDTO>((data) => branchService.create(data), {
    invalidateKey: queryKeys.branches.all(),
    successMessage: "Branch created",
  });

export const useUpdateBranch = () =>
  useAppMutation<Branch, UpdateBranchInput>(({ id, ...data }) => branchService.update(id, data), {
    invalidateKey: queryKeys.branches.all(),
    successMessage: "Branch updated",
  });

export const useDeleteBranch = () =>
  useAppMutation<void, number>((id) => branchService.remove(id), {
    invalidateKey: queryKeys.branches.all(),
    successMessage: "Branch deleted",
  });
