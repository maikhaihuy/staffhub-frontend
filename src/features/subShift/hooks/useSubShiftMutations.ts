import { useAppMutation } from "@/lib/hooks/common/useAppMutation";
import { queryKeys } from "@/lib/queryKeys";
import { SubShift, CreateSubShiftDTO, UpdateSubShiftInput } from "../types";
import { subShiftService } from "../services/subShift.service";

export const useCreateSubShift = (masterShiftId: number) =>
  useAppMutation<SubShift, CreateSubShiftDTO>((data) => subShiftService.create(data), {
    invalidateKey: queryKeys.subShifts.byMasterShift(masterShiftId),
  });

export const useUpdateSubShift = (masterShiftId: number) =>
  useAppMutation<SubShift, UpdateSubShiftInput>(
    ({ id, ...data }) => subShiftService.update(id, data),
    { invalidateKey: queryKeys.subShifts.byMasterShift(masterShiftId) }
  );
