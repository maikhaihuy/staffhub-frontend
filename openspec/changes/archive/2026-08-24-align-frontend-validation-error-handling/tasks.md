## 1. Shared error-parsing helper

- [x] 1.1 Create `src/lib/api/errors.ts` with the `ValidationErrorBody` type (`statusCode`, `message`, `source?`, `errors?: Record<string, string[]>`, `timestamp?`)
- [x] 1.2 Implement `getFieldErrors(error: AxiosError): Record<string, string[]> | undefined`, returning `error.response?.data?.errors` only when `error.response?.status === 400` and the key is present
- [x] 1.3 Implement `normalizeFieldPath(field: string): string` converting bracket-index segments (`items[0].quantity`) to dot form (`items.0.quantity`)

## 2. `useAppMutation` integration

- [x] 2.1 Add an optional `form?: UseFormReturn<any>` option to `useAppMutation` (`src/lib/hooks/common/useAppMutation.ts`)
- [x] 2.2 In the default `onError`, call `getFieldErrors(error)`; when it returns a map, toast `errors._general`'s first message (if present) and, for every other key, call `form.setError(normalizeFieldPath(key), { message: messages[0] })` when `form` was supplied
- [x] 2.3 When `form` was not supplied but field errors are present, fall back to toasting `error.response.data.message` instead of silently dropping the errors
- [x] 2.4 When `getFieldErrors` returns `undefined` (non-400, or 400 without `errors`), keep the exact prior behavior: `toast.error(options?.errorMessage || error.message)`
- [x] 2.5 Confirm existing call sites that don't pass `form` still compile and behave unchanged (toast-only)

## 3. Wire target feature forms

- [x] 3.1 Pass the form instance into the create/update mutations in `src/features/branch/hooks/useBranchMutations.ts` and its calling form component(s)
- [x] 3.2 Pass the form instance into the create/update mutations in `src/features/employee/hooks/useEmployeeMutations.ts` and its calling form component(s)
- [x] 3.3 Pass the form instance into the create/update mutations in `src/features/masterShiftTemplate/hooks/useMasterShiftTemplateMutations.ts`, used from `src/features/masterShiftTemplate/components/edit-dialog.tsx`
- [x] 3.4 Pass the form instance into the create/update mutations in `src/features/subShiftTemplate/hooks/useSubShiftTemplateMutations.ts`, used from `src/features/subShiftTemplate/components/sub-shift-template-section.tsx`
- [x] 3.5 `useTaskTemplateMutations.ts`'s `useCreateTaskTemplate` has no `react-hook-form` instance to wire (the section uses plain `useState` for its single `title` field and has no update mutation) - left as-is, relying on the fallback toast path from 2.3

## 4. Verification

- [x] 4.1 Verified `getFieldErrors` extracts a single-field `errors` entry correctly (no live backend available in this frontend-only repo to drive a real 400 through the UI - verified the parsing/mapping logic directly with a throwaway script exercising `getFieldErrors`/`normalizeFieldPath` against representative `AxiosError`-shaped inputs, then deleted the script; `form.setError` call itself is a single line of well-typed react-hook-form API usage)
- [x] 4.2 Verified a multi-field `errors` object keeps each field's own message(s) independently (same script; see 4.1)
- [x] 4.3 Verified `errors._general` is extracted and routed to the toast branch, separately from other field keys (same script; see 4.1)
- [x] 4.4 Verified `getFieldErrors` returns `undefined` for 401/500 and for a 400 without an `errors` key, so those fall through to the pre-existing `toast.error(message)` path unchanged (same script; see 4.1)
- [x] 4.5 By construction: `getFieldErrors` only reads `error.response`, which only exists in the `onError` branch - a 2xx response never reaches this code path, so it's unaffected without further action
- [x] 4.6 Ran `pnpm lint` and `tsc --noEmit`: `src/lib/api/errors.ts` and all touched call sites are clean; `useAppMutation.ts` has one pre-existing `no-unused-vars` warning on its `mutationFn` type signature (present before this change, unrelated to the `onError`/`FormErrorSetter` additions)
