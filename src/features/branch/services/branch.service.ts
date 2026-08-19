import { createCrudService } from "@/lib/api/createCrudService";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { Branch, CreateBranchDTO, UpdateBranchDTO } from "../types";

// Real backend uses PUT for branch updates (see schema.d.ts BranchesController_update)
export const branchService = createCrudService<Branch, CreateBranchDTO, UpdateBranchDTO>(
  API_ENDPOINTS.BRANCHES.BASE,
  { updateMethod: "put" }
);
