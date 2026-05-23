import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateBranchDTO, UpdateBranchDTO } from "@/features/branch/types";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import axios from "@/lib/api/axios";

const createBranch = async (data: CreateBranchDTO) => {
  const res = await axios.post(API_ENDPOINTS.BRANCHES.BASE, data);
  return res.data;
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branch: CreateBranchDTO) => createBranch(branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}

const updateBranch = async (id: number, data: UpdateBranchDTO) => {
  const res = await axios.put(`${API_ENDPOINTS.BRANCHES.BASE}/${id}`, data);
  return res.data;
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (branch: UpdateBranchDTO) => updateBranch(branch.id, branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}

const deleteBranch = async (id: number) => {
  const res = await axios.delete(`${API_ENDPOINTS.BRANCHES.BASE}/${id}`);
  return res.data;
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] })
    }
  })
}
