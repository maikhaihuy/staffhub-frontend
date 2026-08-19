import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { MasterShift, CreateMasterShiftDTO, UpdateMasterShiftInput } from "../types";
import { masterShiftService } from "../services/masterShift.service";

// Partial key match invalidates every list variant (any branchId/from/to combo).
const LIST_KEY = ["masterShifts", "list"];

export const useCreateMasterShift = () =>
  useAppMutation<MasterShift, CreateMasterShiftDTO>(
    (data) => masterShiftService.create(data),
    { invalidateKey: LIST_KEY, successMessage: "Shift created" }
  );

export const useUpdateMasterShift = () =>
  useAppMutation<MasterShift, UpdateMasterShiftInput>(
    ({ id, ...data }) => masterShiftService.update(id, data),
    { invalidateKey: LIST_KEY, successMessage: "Shift updated" }
  );

export const useDeleteMasterShift = () =>
  useAppMutation<void, number>((id) => masterShiftService.remove(id), {
    invalidateKey: LIST_KEY,
    successMessage: "Shift deleted",
  });

export const useGenerateMasterShift = () =>
  useAppMutation<MasterShift, { masterShiftTemplateId: number; workDate: string }>(
    ({ masterShiftTemplateId, workDate }) =>
      masterShiftService.generate(masterShiftTemplateId, workDate),
    { invalidateKey: LIST_KEY, successMessage: "Shift generated" }
  );
