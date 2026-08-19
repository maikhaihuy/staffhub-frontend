import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { User, CreateUserDTO, UpdateUserDTO } from "../types";

// Real backend uses PUT for user updates (see schema.d.ts UsersController_update)
export const userService = createCrudService<User, CreateUserDTO, UpdateUserDTO>(
  API_ENDPOINTS.USERS.BASE,
  { updateMethod: "put" }
);
