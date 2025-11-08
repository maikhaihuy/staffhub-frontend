import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useAppQuery<TData, TError = AxiosError>(
  key: unknown[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  return useQuery<TData, TError>({
    queryKey: key,
    queryFn,
    staleTime: 1000 * 60, // 1 phút cache
    refetchOnWindowFocus: false,
    ...options,
  });
}
