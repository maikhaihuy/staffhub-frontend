import axios from "@/lib/api/axios";
import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Assignment, CreateAssignmentDTO, UpdateAssignmentDTO, CheckInDTO, CheckOutDTO } from "../types";

const base = createCrudService<Assignment, CreateAssignmentDTO, UpdateAssignmentDTO>(
  API_ENDPOINTS.ASSIGNMENTS.BASE
);

export const assignmentService = {
  ...base,
  listBySubShift: (subShiftId: number) => base.list({ subShiftId }),
  listByEmployee: (employeeId: number) => base.list({ employeeId }),

  checkIn: async (id: number, data: CheckInDTO): Promise<Assignment> => {
    const res = await axios.post<Assignment>(API_ENDPOINTS.ASSIGNMENTS.CHECK_IN(id), data);
    return res.data;
  },

  checkOut: async (id: number, data: CheckOutDTO): Promise<Assignment> => {
    const res = await axios.post<Assignment>(API_ENDPOINTS.ASSIGNMENTS.CHECK_OUT(id), data);
    return res.data;
  },
};
