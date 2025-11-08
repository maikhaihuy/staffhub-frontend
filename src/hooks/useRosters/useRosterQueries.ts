import { getRostersByEmployee } from "@/features/roster/api";
import { useQuery } from "@tanstack/react-query";

export const useGetRostersByEmployee = (employeeId: number) =>
  useQuery({
    queryKey: ["getRostersByEmployee", +employeeId],
    queryFn: () => getRostersByEmployee(+employeeId),
    enabled: !!employeeId,
  });

// export const useGetRostersByEmployee = (employeeId: number) =>
//   useAppQuery(["rosters", "employee", employeeId], async () => await getRostersByEmployee(+employeeId))