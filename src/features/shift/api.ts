import { sampleShifts, Shift } from "./types";
import axios from "@/lib/axios";

const ENDPONT_NAME = "/api/shifts";

export const getShiftsByCurrentRole = async (): Promise<Shift[]> => sampleShifts;

export const getShiftsByBranch = async (branchId: number): Promise<Shift[]> => {
  const res = await axios.get(`branches/${branchId}/shifts`);
  return res.data;
};

export const getDetailShift = async (shiftId: number): Promise<Shift> => {
  const res = await axios.get(`${ENDPONT_NAME}/${shiftId}`);
  return res.data;
};

export const create = async (data: Partial<Shift>) => {
  const res = await axios.post(ENDPONT_NAME, data);
  return res.data;
};

export const update = async (id: number, data: Partial<Shift>) => {
  const res = await axios.put(`${ENDPONT_NAME}/${id}`, data);
  return res.data;
};

export const remove = async (id: number) => {
  const res = await axios.delete(`${ENDPONT_NAME}/${id}`);
  return res.data;
};
