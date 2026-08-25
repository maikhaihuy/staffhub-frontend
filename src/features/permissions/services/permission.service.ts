import axios from "@/lib/api/axios";
import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Permission, CreatePermissionDTO, UpdatePermissionDTO, PermissionCatalogEntry } from "../types";

export const permissionService = {
  ...createCrudService<Permission, CreatePermissionDTO, UpdatePermissionDTO>(
    API_ENDPOINTS.PERMISSIONS.BASE
  ),
  getCatalog: async (): Promise<PermissionCatalogEntry[]> => {
    const res = await axios.get<PermissionCatalogEntry[]>(API_ENDPOINTS.PERMISSIONS.CATALOG);
    return res.data;
  },
};
