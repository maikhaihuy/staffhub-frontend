import { useQuery } from "@tanstack/react-query";
import { getDetailShift, getShiftsByBranch } from "@/features/shift/services/shift.service";
import { queryKeys } from "@/lib/queryKeys";

export const useGetShiftsByBranch = (branchId: number) => useQuery({
    queryKey: queryKeys.shifts.byBranch(branchId),
    queryFn: () => getShiftsByBranch(+branchId),
    enabled: !!branchId,
  });

export const useGetDetailShift = (shiftId: number) => useQuery({
    queryKey: queryKeys.shifts.detail(shiftId),
    queryFn: () => getDetailShift(shiftId),
    enabled: !!shiftId,
  });
