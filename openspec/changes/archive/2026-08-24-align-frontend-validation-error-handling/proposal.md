## Why

The backend now returns field-level validation detail (an `errors` map keyed by field name, plus a reserved `errors._general` for non-field business-rule errors) on every 400 response, instead of only a flat `message` string. Today's frontend `useAppMutation`/`useAppQuery` wrapper and every feature form only reads `error.message` for a single generic toast, so a 400 with multiple invalid fields (e.g. a duplicate name AND a missing branch) surfaces as one unspecific toast instead of pointing the admin at the fields to fix. We need a shared way to consume the new `errors` shape so form fields get inline errors and non-field errors still reach the user.

## What Changes

- Add a shared helper (e.g. `getValidationErrors` / `applyServerErrors`) that reads `error.response.data` from an `AxiosError`, and when `statusCode === 400` and `errors` is present, returns the field→messages map with bracket-array keys (`items[0].quantity`) normalized to the dot form (`items.0.quantity`) that `react-hook-form`'s `setError` expects.
- Extend `useAppMutation` (`src/lib/hooks/common/useAppMutation.ts`) so its default `onError` applies field errors onto a caller-supplied form instance (when one is passed via a new option) via `form.setError(field, { message })`, routes `errors._general` (if present) to the existing toast, and otherwise falls back to today's `toast.error(message)` behavior for non-400s and 400s with no `errors` key.
- Update feature forms/dialogs that submit create/update mutations to pass their `react-hook-form` instance into the mutation options so server-side field errors render inline instead of only as a toast.
- No change to request payloads, HTTP methods, or the shape of success responses — this is purely how 400 error bodies are consumed on the frontend.

## Capabilities

### New Capabilities
- `api-error-handling`: shared frontend contract for parsing the backend's `{ statusCode, message, errors }` 400 response shape and applying it to toasts and `react-hook-form` field errors.

### Modified Capabilities
(none — no existing spec currently documents error-response handling; this introduces the capability rather than changing one)

## Impact

- `src/lib/api/axios.ts` — no interceptor change needed (still rejects with the raw `AxiosError`; shape parsing happens at the consumption site), but the response body's `data` shape gains an optional `errors` key.
- `src/lib/hooks/common/useAppMutation.ts` — default `onError` behavior gains form-error-mapping support.
- New shared module under `src/lib/api/` (or `src/lib/hooks/common/`) for the error-parsing helper and its types.
- Feature forms across `branch`, `employee`, `masterShiftTemplate`, `subShiftTemplate`, `taskTemplate`, `roster`, `schedule`, etc. that call `useAppMutation` for create/update — each is updated opportunistically to wire its form into the new mapping, but this proposal's scope is the shared mechanism plus the highest-traffic forms, not an exhaustive one-shot migration of every mutation call site.
