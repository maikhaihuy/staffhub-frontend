import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Permission, CreatePermissionDTO, UpdatePermissionDTO } from "../types";

export const permissionService = createCrudService<
  Permission,
  CreatePermissionDTO,
  UpdatePermissionDTO
>(API_ENDPOINTS.PERMISSIONS.BASE);
