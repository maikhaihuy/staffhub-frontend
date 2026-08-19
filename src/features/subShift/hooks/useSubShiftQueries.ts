import { queryKeys } from "@/lib/queryKeys";
import { useAppQuery } from "@/lib/hooks/common/useAppQuery";
import { subShiftService } from "../services/subShift.service";
import { SubShift } from "../types";

export const useGetSubShiftsByMasterShift = (masterShiftId: number) =>
  useAppQuery<SubShift[]>(
    queryKeys.subShifts.byMasterShift(masterShiftId),
    () => subShiftService.listByMasterShift(masterShiftId),
    { enabled: !!masterShiftId }
  );
