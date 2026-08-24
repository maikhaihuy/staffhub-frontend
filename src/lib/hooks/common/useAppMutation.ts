import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { getFieldErrors, normalizeFieldPath, ValidationErrorBody } from "@/lib/api/errors"

// Duck-typed subset of react-hook-form's UseFormReturn - avoids coupling to a
// specific form's field-value type. The backend's validation field keys are
// dynamic strings (not known ahead of time), so they can't be checked against
// a specific form's statically-typed field-path union.
export interface FormErrorSetter {
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
  setError: (name: any, error: { message: string }) => void
}

export function useAppMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, AxiosError, TVariables> & {
    invalidateKey?: unknown[]
    successMessage?: string
    errorMessage?: string
    form?: FormErrorSetter
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
      const fieldErrors = getFieldErrors(error)

      if (fieldErrors) {
        const { _general, ...restFieldErrors } = fieldErrors
        const fieldEntries = Object.entries(restFieldErrors)

        if (_general?.[0]) {
          toast.error(_general[0])
        }

        if (options?.form && fieldEntries.length > 0) {
          for (const [field, messages] of fieldEntries) {
            options.form.setError(normalizeFieldPath(field), { message: messages[0] })
          }
        } else if (!options?.form && fieldEntries.length > 0) {
          const body = error.response?.data as ValidationErrorBody | undefined
          toast.error(body?.message || error.message)
        }
      } else {
        // ✅ hiển thị lỗi mặc định hoặc custom
        toast.error(options?.errorMessage || error.message)
      }

      // ✅ callback người dùng
      if (options?.onError) {
        options.onError(error, variables, context, mutation)
      }
    },
  })
}
