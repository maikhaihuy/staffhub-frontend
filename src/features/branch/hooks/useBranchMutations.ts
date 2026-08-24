import { FormErrorSetter, useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { Branch, CreateBranchDTO, UpdateBranchInput } from "@/features/branch/types";
import { branchService } from "../services/branch.service";

export const useCreateBranch = (form?: FormErrorSetter) =>
  useAppMutation<Branch, CreateBranchDTO>((data) => branchService.create(data), {
    invalidateKey: queryKeys.branches.all(),
    successMessage: "Branch created",
    form,
  });

export const useUpdateBranch = (form?: FormErrorSetter) =>
  useAppMutation<Branch, UpdateBranchInput>(({ id, ...data }) => branchService.update(id, data), {
    invalidateKey: queryKeys.branches.all(),
    successMessage: "Branch updated",
    form,
  });

export const useDeleteBranch = () =>
  useAppMutation<void, number>((id) => branchService.remove(id), {
    invalidateKey: queryKeys.branches.all(),
    successMessage: "Branch deleted",
  });
