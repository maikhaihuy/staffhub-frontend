import axios from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Role } from "../types";

export const roleService = {
  list: async (): Promise<Role[]> => {
    const res = await axios.get<Role[]>(API_ENDPOINTS.ROLES.BASE);
    return res.data;
  },
};
