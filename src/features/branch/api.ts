import { Branch } from "./types";
import axios from "@/lib/axios";

const ENDPONT_NAME = "/api/branches";

export const getBranches = async ({
  page,
  pageSize,
  all,
}: {
  page?: number;
  pageSize?: number;
  all?: boolean;
}): Promise<{ data: Branch[]; total: number }> => {
  const res = await axios.get(
    `${ENDPONT_NAME}?all=${all}page=${page}&pageSize=${pageSize}`
  );
  return res.data;
};

export const getBranch = async (id: number): Promise<Branch> => {
  const res = await axios.get(`${ENDPONT_NAME}/${id}`);
  return res.data;
};

export const createBranch = async (data: Partial<Branch>) => {
  const res = await axios.post(ENDPONT_NAME, data);
  return res.data;
};

export const updateBranch = async (data: Partial<Branch>) => {
  const res = await axios.put(`${ENDPONT_NAME}/${data.id}`, data);
  return res.data;
};

export const deleteBranch = async (id: string) => {
  const res = await axios.delete(`${ENDPONT_NAME}/${id}`);
  return res.data;
};
