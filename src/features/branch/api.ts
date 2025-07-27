import { Branch } from "./types";
import axios from "@/lib/axios";
import { QueryRequest } from "@/lib/interface";
import { buildQueryString } from "@/lib/utils";

const ENDPONT_NAME = "/api/branches";

export const getBranches = async (
  queryRequest: QueryRequest<Branch>
): Promise<{ data: Branch[]; total: number }> => {
  const queryString = buildQueryString(queryRequest);
  const res = await axios.get(`${ENDPONT_NAME}${queryString}`);
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
