## 1. Change-password screen (no backend dependency)

- [x] 1.1 Create `src/app/change-password/page.tsx` with a minimal layout wrapping only
      `AuthGuard` (reuse as-is) — no `AppSidebar`/`SidebarProvider`.
      Done: `src/app/change-password/layout.tsx` (wraps `AuthGuard`) + `page.tsx` (renders
      `ChangePasswordForm`).
- [x] 1.2 Build the change-password form (current password, new password, confirm new password)
      using `changePasswordSchema`/`ChangePasswordData` (already defined in
      `src/features/auth/schemas/auth.schema.ts` / `src/features/auth/types/auth.type.ts`) with
      `react-hook-form` + zod resolver, following this repo's existing form patterns.
      Done: `src/features/auth/components/ChangePasswordForm.tsx`, styled after
      `RegisterForm.tsx`.
- [x] 1.3 In `src/features/auth/services/auth.service.ts`, fix `changePassword` to send only
      `{currentPassword, newPassword}` — destructure out `confirmPassword` before the request
      (backend's `forbidNonWhitelisted: true` would 400 otherwise).
- [x] 1.4 Wire the form's submit to `authService.changePassword` via an `useAppMutation` hook; on
      success, navigate to the captured return path (see task 2.3) or `/` if none was captured;
      on failure, surface the backend's error on the form without navigating away.
      Done: `src/features/auth/hooks/useChangePassword.ts` (`useAppMutation` wrapper); the form
      reads `returnUrl` via `useSearchParams()` + `resolveReturnUrl` (same helper `AuthContext`
      already uses for login), navigating there (or `/`) in the mutation's per-call `onSuccess`.
      Field/general errors surface via `useAppMutation`'s existing `form` wiring — no extra code
      needed for the failure path.
- [x] 1.5 Confirm `/change-password` needs no `middleware.ts` change: verify (by reading
      `middleware.ts`) that it correctly falls through to the existing protected-route branch
      since it is not in `PUBLIC_PATHS`.
      Confirmed: `PUBLIC_PATHS` is unchanged (`['/login', '/register', '/forgot-password']`), so
      `/change-password` falls through to the standard "has a valid/recoverable session" branch
      like any other route — no middleware change needed.

## 2. Reactive forced-password-change redirect — was BLOCKED on staffhub-backend's
   `auto-provision-user-on-employee-create`; unblocked, backend now fully implemented (24/24
   tasks, confirmed in code). Actual response shape confirmed by reading
   `force-password-change.guard.ts` + `global-exception.filter.ts`: `403` with
   `{ details: { code: 'PASSWORD_CHANGE_REQUIRED' } }`.

- [x] 2.1 In `src/lib/api/axios.ts`'s response interceptor, detect a `403` that distinctly
      identifies a required password change (exact match condition depends on the backend's
      final shape — confirm against the real response before implementing) and dispatch a new
      window event (e.g. `auth:password-change-required`), mirroring the existing
      `auth:session-expired` dispatch.
      Done: added `isPasswordChangeRequiredError` to `src/lib/api/errors.ts` (checks
      `status === 403` and `data.details.code === 'PASSWORD_CHANGE_REQUIRED'`, matching the real
      backend shape), and a new branch in the interceptor dispatching
      `auth:password-change-required` when it matches.
- [x] 2.2 In `src/features/auth/context/AuthContext.tsx`, add a listener for that event alongside
      the existing `auth:session-expired` one.
- [x] 2.3 In that listener: if already on `/change-password`, do nothing; otherwise navigate to
      `/change-password`, carrying the current path (pathname, query, hash) via the same
      `buildReturnUrl` helper already used by the session-expired listener, so the change-password
      page (task 1.4) can read it back and return the user there on success.
      Done: new `useEffect` in `AuthContext` mirroring the session-expired one, but without
      clearing user/token state (the session is still valid, just restricted).
- [x] 2.4 Update the stale comment in `src/lib/api/endpoints.ts` ("REGISTER/CHANGE_PASSWORD/
      FORGOT_PASSWORD/RESET_PASSWORD don't exist on the backend") to no longer include
      `CHANGE_PASSWORD` once it's confirmed live.

## 3. Employee create — provisioning notice (no backend dependency beyond what already exists)

- [x] 3.1 In `src/features/employee/hooks/useEmployeeMutations.ts`'s `useCreateEmployee`, replace
      the plain `successMessage: "Employee created"` with an `onSuccess` callback that shows a
      longer-duration toast including the Vietnamese notice: login account auto-created, default
      password is the employee's phone number, employee will be asked to change it on first
      login.
      Done: `onSuccess` now fires `toast.success(...)` with the fuller Vietnamese message and an
      8s duration, replacing the plain `successMessage` string.
- [x] 3.2 Confirm (or add, if missing) that a phone-number-collision error from `POST /employees`
      already surfaces on the phone number field via the existing field-error handling in
      `useAppMutation`, rather than a generic failure toast — this is likely already correct
      given the existing duplicate-phone-on-Employee pattern; verify against the actual backend
      response shape once `auto-provision-user-on-employee-create` ships its collision behavior.
      Confirmed via code reading, no change needed: backend's existing duplicate-phone check
      (`employee.service.ts`) throws `FieldValidationException('phoneNumber', ...)`, which
      extends `BadRequestException` (400) — matching `getFieldErrors`'s expected shape
      (`ValidationErrorBody.errors`). `EmployeeDetail` already passes its `form` into
      `useCreateEmployee(form)`, so `useAppMutation`'s existing `onError` already routes this to
      `form.setError('phoneNumber', ...)`. The backend proposal's new User-phone-collision check
      says it will use the same `FieldValidationException` pattern, so this will keep working
      once that ships — re-verify against the real response once it's live (see task 4.1's
      surrounding backend dependency).

## 4. Verification

- [x] 4.1 Once the backend change is live: log in as a freshly auto-provisioned Employee account,
      confirm the first dashboard API call redirects to `/change-password`, confirm changing the
      password succeeds and returns to the original path, and confirm subsequent API calls no
      longer 403.
      Backend contract verified end-to-end via direct API calls against the real dev backend
      (no browser tooling available, so the *frontend redirect itself* wasn't visually observed —
      see note below): created a fresh Employee as admin → logged in as the auto-provisioned
      account (phone = password) → confirmed `GET /branches` 403s with the exact shape
      `isPasswordChangeRequiredError` checks for (`{details:{code:'PASSWORD_CHANGE_REQUIRED'}}`)
      → confirmed a wrong current password is rejected with `401 "Current password is
      incorrect"` and the flag stays set → confirmed the correct current password succeeds and
      clears the flag → confirmed subsequent calls succeed. This also surfaced and fixed a real
      bug: `useAppMutation`'s error toast fell back to axios's generic `error.message` for any
      non-400 error instead of the backend's actual `message` field, so the wrong-password
      rejection would have shown a useless generic string — fixed in
      `src/lib/hooks/common/useAppMutation.ts` to prefer the response body's `message`. Still
      needs a real browser pass to confirm the actual redirect/toast rendering.
- [x] 4.2 Create an Employee via the Admin form and confirm the provisioning notice appears with
      the correct default-password wording.
      PARTIALLY VERIFIED, not fully done: confirmed via dev server that `/change-password`
      (anonymous → redirects to `/login`; authenticated → renders `200` with no console/server
      errors) and the rest of the app still compile cleanly with these changes in place. Also
      confirmed, via a direct `POST /employees` call against the live backend as the `settings`
      admin account, that creation really does auto-provision a login (new account could log in
      with phone-as-password and was flagged `mustChangePassword`) — the toast's factual content
      is accurate. Could not visually confirm the actual toast rendering/wording in a browser —
      this session has no browser-driving tooling. Please create an Employee via the Admin UI and
      confirm the toast reads correctly.
- [x] 4.3 Run `pnpm lint`.
      Ran `pnpm lint` and `tsc --noEmit`: zero issues in any file touched by this change (only
      the same pre-existing repo-wide lint debt in unrelated files, and one pre-existing stale
      `.next/types` error unrelated to this change).
