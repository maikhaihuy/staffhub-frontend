import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

export function useAppMutation<TData, TVariables>(
  mutationFn: () => Promise<TData>,
  options?: UseMutationOptions<TData, AxiosError, TVariables> & {
    invalidateKey?: unknown[]
    successMessage?: string
    errorMessage?: string
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TData, AxiosError, TVariables>({
    mutationFn,
    onSuccess: async (data, _variables, _context, _mutation) => {
      // ✅ invalidate cache nếu có
      if (options?.invalidateKey) {
        await queryClient.invalidateQueries({ queryKey: options.invalidateKey })
      }

      // ✅ hiển thị toast nếu có message
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }

      // ✅ gọi callback người dùng (nếu có)
      if (options?.onSuccess) {
        await options.onSuccess(data, _variables, _context, _mutation)
      }
    },
    onError: (error, _variables, _context, _mutation) => {
      // ✅ hiển thị lỗi mặc định hoặc custom
      toast.error(options?.errorMessage || error.message)

      // ✅ callback người dùng
      if (options?.onError) {
        options.onError(error, _variables, _context, _mutation)
      }
    },
    ...options,
  })
}
