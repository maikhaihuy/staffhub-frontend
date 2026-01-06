import { Shift } from "../types/shift.types";
import axios from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {sampleShifts} from "@/mocks/data/shifts";

export const getShiftsByCurrentRole = async (): Promise<Shift[]> => sampleShifts;

export const getShiftsByBranch = async (branchId: number): Promise<Shift[]> => {
  const res = await axios.get(`${API_ENDPOINTS.SHIFFTS}?branchId=${branchId}`);
  return res.data;
};

export const getDetailShift = async (shiftId: number): Promise<Shift> => {
  const res = await axios.get(`${API_ENDPOINTS.SHIFFTS}/${shiftId}`);
  return res.data;
};

export const create = async (data: Partial<Shift>) => {
  const res = await axios.post(API_ENDPOINTS.SHIFFTS, data);
  return res.data;
};

export const update = async (id: number, data: Partial<Shift>) => {
  const res = await axios.put(`${API_ENDPOINTS.SHIFFTS}/${id}`, data);
  return res.data;
};

export const remove = async (id: number) => {
  const res = await axios.delete(`${API_ENDPOINTS.SHIFFTS}/${id}`);
  return res.data;
};
