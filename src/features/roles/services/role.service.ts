import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Role, CreateRoleDTO, UpdateRoleDTO } from "../types";

export const roleService = createCrudService<Role, CreateRoleDTO, UpdateRoleDTO>(
  API_ENDPOINTS.ROLES.BASE
);
