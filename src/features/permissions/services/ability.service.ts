import axios from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { AbilityRule } from "../types";

export const abilityService = {
  getMine: async (): Promise<AbilityRule[]> => {
    const res = await axios.get<AbilityRule[]>(API_ENDPOINTS.ME_ABILITIES);
    return res.data;
  },

  getForUser: async (userId: number): Promise<AbilityRule[]> => {
    const res = await axios.get<AbilityRule[]>(
      API_ENDPOINTS.USER_ABILITIES(userId)
    );
    return res.data;
  },
};
