import axios from "@/lib/api/axios";
import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { User, CreateUserDTO, UpdateUserDTO } from "../types";

// Real backend uses PUT for user updates (see schema.d.ts UsersController_update)
export const userService = {
  ...createCrudService<User, CreateUserDTO, UpdateUserDTO>(API_ENDPOINTS.USERS.BASE, {
    updateMethod: "put",
  }),

  // Role membership isn't part of UpdateUserDto - it's managed via these
  // additive/removal endpoints instead (POST /users/:id/roles requires the
  // user to keep at least one role; DELETE 400s on the last remaining one).
  assignRoles: async (userId: number, roleIds: number[]): Promise<User> => {
    const res = await axios.post<User>(API_ENDPOINTS.USERS.ROLES(userId), { roleIds });
    return res.data;
  },
  removeRole: async (userId: number, roleId: number): Promise<User> => {
    const res = await axios.delete<User>(API_ENDPOINTS.USERS.ROLE_BY_ID(userId, roleId));
    return res.data;
  },

  // No GET endpoint exists yet for a user's currently-managed branches -
  // these calls are write-only (see tasks.md 6.3).
  assignManagerBranches: async (userId: number, branchIds: number[]): Promise<void> => {
    await axios.post(API_ENDPOINTS.USERS.MANAGER_BRANCHES(userId), { branchIds });
  },
  removeManagerBranch: async (userId: number, branchId: number): Promise<void> => {
    await axios.delete(API_ENDPOINTS.USERS.MANAGER_BRANCH_BY_ID(userId, branchId));
  },
};
