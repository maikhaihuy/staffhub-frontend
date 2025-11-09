import { getSchedulesByBranch } from "@/features/schedule/api";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export const useGetSchedulesByBranch = (branchId: number) =>
  useQuery({
    queryKey: queryKeys.schedules.withRosters(branchId),
    queryFn: () => getSchedulesByBranch(+branchId),
    enabled: !!branchId,
  });
