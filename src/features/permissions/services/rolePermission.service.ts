import axios from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { PermissionGrant, RolePermission } from "../types";

export const rolePermissionService = {
  getByRole: async (roleId: number): Promise<RolePermission[]> => {
    const res = await axios.get<RolePermission[]>(
      API_ENDPOINTS.ROLE_PERMISSIONS.BY_ROLE(roleId)
    );
    return res.data;
  },

  // Additive/upsert-per-pair: only the (roleId, permissionId) pairs listed
  // here are created or updated - other existing grants on the role are
  // left untouched (see design.md's Decisions).
  assign: async (
    roleId: number,
    grants: PermissionGrant[]
  ): Promise<RolePermission[]> => {
    const res = await axios.post<RolePermission[]>(
      API_ENDPOINTS.ROLE_PERMISSIONS.BASE,
      { roleId, grants }
    );
    return res.data;
  },

  removeAllForRole: async (roleId: number): Promise<void> => {
    await axios.delete(API_ENDPOINTS.ROLE_PERMISSIONS.BY_ROLE(roleId));
  },

  remove: async (roleId: number, permissionId: number): Promise<void> => {
    await axios.delete(
      API_ENDPOINTS.ROLE_PERMISSIONS.BY_ROLE_AND_PERMISSION(roleId, permissionId)
    );
  },
};
