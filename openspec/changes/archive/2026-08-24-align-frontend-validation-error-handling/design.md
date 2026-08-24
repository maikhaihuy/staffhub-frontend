## Context

See proposal.md - Why. Relevant current state:

- `src/lib/api/axios.ts` exports a shared axios `instance`; its response interceptor only handles 401 refresh-and-retry and otherwise rejects with the raw `AxiosError` — no response-shape parsing happens there today.
- `src/lib/hooks/common/useAppMutation.ts` wraps `useMutation` with a default `onError: (error) => toast.error(options?.errorMessage || error.message)`. Every feature mutation hook (`use<Feature>Mutations.ts`) goes through this wrapper.
- Feature forms use `react-hook-form` (`useForm` + Zod resolver). No form currently calls `form.setError` from a server response — the one existing `setError` call site (`sub-shift-template-section.tsx`) is client-side time-range validation, unrelated to server errors.
- There is no shared `ApiError`/`ValidationErrorBody` type today; `AxiosError`'s `response.data` is untyped (`any`).

## Goals / Non-Goals

**Goals:**
- One shared, typed way to detect the new `{ statusCode, message, errors }` 400 shape and read it, usable both inside `useAppMutation`'s default `onError` and standalone (for call sites not using the hook, e.g. `AuthContext`'s manual try/catch flows).
- Let a mutation caller opt in to automatic `form.setError` mapping by passing its `react-hook-form` instance, without forcing every mutation call site to change.
- Correctly bridge the backend's `items[0].quantity` bracket-index key format to `react-hook-form`'s `items.0.quantity` dot format.

**Non-Goals:**
- Migrating every existing `useAppMutation` call site to pass a form instance in this change — only the shared mechanism plus a representative set of forms (see proposal.md - Impact). Remaining call sites keep today's toast-only behavior until touched.
- Changing `AuthContext`'s login/register error handling flows (they don't submit `react-hook-form`-backed forms in the same way); out of scope unless it's low-cost to align them.
- Any backend change — the response shape is already implemented server-side.

## Decisions

**Shared parsing helper location and shape.** Add `src/lib/api/errors.ts` exporting:
- A `ValidationErrorBody` type: `{ statusCode: number; message: string; source?: string; errors?: Record<string, string[]>; timestamp?: string }`.
- `getFieldErrors(error: AxiosError): Record<string, string[]> | undefined` — returns `error.response?.data?.errors` when `status === 400` and the key is present, else `undefined`. Keeps the check colocated so both `useAppMutation` and any manual `try/catch` (e.g. `AuthContext`) can reuse it instead of re-deriving the 400+`errors` condition independently.
- `normalizeFieldPath(field: string): string` — applies `field.replace(/\[(\d+)\]/g, '.$1')` to convert `items[0].quantity` to `items.0.quantity`. Kept as a separate exported function (not inlined) so it's independently testable given it encodes a specific regex contract from the proposal.

Alternative considered: parsing inline inside `useAppMutation` only. Rejected because `AuthContext`'s login/register/refresh flows also do manual `axios` try/catch outside React Query and would otherwise duplicate the 400/`errors` detection logic.

**`useAppMutation` integration.** Add an optional `form?: FormErrorSetter` option, where `FormErrorSetter` is a small duck-typed interface (`{ setError: (name, error: { message: string }) => void }`) exported from `useAppMutation.ts`, rather than `UseFormReturn<any>` from `react-hook-form`. This was a mid-implementation correction: `UseFormReturn<T>` is invariant in `T` (its `watch`/`setError` signatures reference `T` in both positions), so a shared `UseFormReturn<FieldValues>` parameter type rejects every concrete form (`UseFormReturn<BranchFormValues>` is not assignable to it) — and reintroducing `any` there (`UseFormReturn<any>`) trips the repo's `@typescript-eslint/no-explicit-any` lint rule at every call site that declares the option. The duck-typed `FormErrorSetter` sidesteps both problems: any concrete `UseFormReturn<T>` structurally satisfies it (only `setError` is needed), and the single unavoidable `any` (the dynamic backend field name can't be checked against a specific form's static field-path union) is isolated to one interface property with a scoped `eslint-disable-next-line`. In the default `onError`:
1. Call `getFieldErrors(error)`.
2. If present, iterate entries: for key `_general`, `toast.error(messages[0])`; for every other key, if `form` was supplied, call `form.setError(normalizeFieldPath(key), { message: messages[0] })`. If `form` was not supplied (caller didn't opt in), fall back to toasting the general `message` once instead of silently dropping field errors.
3. If `getFieldErrors` returns `undefined` (no `errors` key — includes all non-400s and 400s without `errors`), keep today's exact behavior: `toast.error(options?.errorMessage || error.message)`.

This keeps the hook's public surface additive (`form` is optional) so existing call sites compile and behave unchanged until they opt in. Each feature's `use<Feature>Mutations.ts` wrapper hooks (`useCreateBranch`, `useUpdateBranch`, etc.) also gained an optional `form?: FormErrorSetter` parameter that they forward into `useAppMutation`'s options, since those wrapper hooks — not the calling components — are what call `useAppMutation` directly.

Alternative considered: a separate `useAppFormMutation` hook instead of extending `useAppMutation`. Rejected — it would fork two near-identical implementations and existing call sites would need to be migrated to the new hook name just to get the fallback-to-toast behavior for non-form 400s, with no real behavioral isolation benefit.

**Which forms to migrate now.** Per proposal.md - Impact, wire the `form` option into the create/update mutation call sites already backed by `react-hook-form` in the modules touched most recently (`masterShiftTemplate`, `subShiftTemplate`, `taskTemplate`, `branch`, `employee`), rather than attempting an exhaustive sweep of every feature in this change.

## Risks / Trade-offs

- [Risk] A backend field key doesn't match any registered `react-hook-form` field name (e.g. the backend validates a field the form doesn't render, or names diverge) → `form.setError` on an unregistered path is a no-op in RHF, so that message would silently not appear. Mitigation: also toast the first unmatched field's message as a fallback is out of scope for this change (would require diffing against the form's registered field names); acceptable because backend DTO field names are expected to already match form field names in the migrated forms, and this is flagged here rather than silently declared a non-issue.
- [Risk] Only a subset of mutation call sites are migrated, so behavior is inconsistent across the app until the remaining ones are touched → Mitigation: unmigrated call sites keep their current (pre-change) toast-only behavior exactly, so this is a strict improvement with no regression, just uneven rollout.
- [Trade-off] Putting `form` on `UseMutationOptions` couples a React Query hook to a form-shaped value. Accepted because `useAppMutation` is already form-submission-oriented in practice across this codebase, and the option is optional and duck-typed (`FormErrorSetter`, satisfied structurally by any `react-hook-form` `UseFormReturn<T>`) rather than a hard dependency.

## Migration Plan

1. Add `src/lib/api/errors.ts` (`ValidationErrorBody`, `getFieldErrors`, `normalizeFieldPath`).
2. Extend `useAppMutation` with the `form` option and updated `onError`, preserving the exact prior behavior when `form` is omitted or `errors` is absent.
3. Wire `form` into the mutation call sites listed under Decisions, one feature at a time; each is independently verifiable (submit an invalid payload, confirm inline field errors + toast for `_general`).
4. No rollback complexity: the change is additive and behavior-preserving for any call site that doesn't opt in, so reverting is a plain revert of the touched files.
