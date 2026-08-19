import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { masterShiftService } from "../services/masterShift.service";
import { MasterShift } from "../types";

export const useGetMasterShiftsByBranch = (branchId: number, from?: string, to?: string) =>
  useAppQuery<MasterShift[]>(
    queryKeys.masterShifts.list({ branchId, from, to }),
    () => masterShiftService.listByBranch(branchId, from, to),
    { enabled: !!branchId }
  );

export const useGetMasterShift = (id: number) =>
  useAppQuery<MasterShift>(
    queryKeys.masterShifts.detail(id),
    () => masterShiftService.getById(id),
    { enabled: !!id }
  );
