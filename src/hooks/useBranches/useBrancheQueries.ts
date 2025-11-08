import { useQuery } from "@tanstack/react-query";
import { getBranchWithSchedulesByEmployee } from "@/features/branch/api";

export const useGetBranchesWithSchedulesByEmployee = (employeeId: number) => useQuery({
    queryKey: ["getBranchWithSchedulesByEmployee", +employeeId],
    queryFn: () => getBranchWithSchedulesByEmployee(+employeeId),
    enabled: !!employeeId,
  });