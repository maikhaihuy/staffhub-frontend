import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

export function useAppMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, AxiosError, TVariables> & {
    invalidateKey?: unknown[]
    successMessage?: string
    errorMessage?: string
  }
) {
  const queryClient = useQueryClient()

  return useMutation<TData, AxiosError, TVariables>({
    ...options,
    mutationFn,
    onSuccess: async (data, variables, context, mutation) => {
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
        await options.onSuccess(data, variables, context, mutation)
      }
    },
    onError: (error, variables, context, mutation) => {
      // ✅ hiển thị lỗi mặc định hoặc custom
      toast.error(options?.errorMessage || error.message)

      // ✅ callback người dùng
      if (options?.onError) {
        options.onError(error, variables, context, mutation)
      }
    },
  })
}
