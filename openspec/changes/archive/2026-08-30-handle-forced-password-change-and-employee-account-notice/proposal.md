## Why

`staffhub-backend`'s proposed `auto-provision-user-on-employee-create` change (proposal + specs
done, `design.md`/`tasks.md` not yet written — see `../staffhub-backend/openspec/changes/
auto-provision-user-on-employee-create/`) will auto-create a `User` (default password = phone
number, `mustChangePassword = true`) whenever an Admin creates an `Employee`, and will reject any
authenticated API call other than change-password/logout/refresh with `403
PASSWORD_CHANGE_REQUIRED` until that flag is cleared via a new `POST /auth/change-password`.
Confirmed by code search: this frontend has **no change-password page or form anywhere** (only a
dormant `changePasswordSchema`/`ChangePasswordData`/`authService.changePassword` — unused,
pointed at an endpoint the `endpoints.ts` comment currently (and, once the backend change ships,
incorrectly) says "doesn't exist on the backend"), and the Employee create form gives the Admin no
indication that creating an Employee also creates a login account. Once the backend ships, every
new Employee's session would be able to log in but then get `403`'d on everything with nowhere to
go — this change is the frontend half needed for that to actually work.

**Cross-repo dependency**: do not implement the redirect/guard piece of this change until
`auto-provision-user-on-employee-create` has shipped `mustChangePassword` enforcement and
`POST /auth/change-password` on the backend — there is nothing for it to react to before then.

## What Changes

- **New `/change-password` screen**: current password, new password, confirm new password;
  submits to `POST /auth/change-password` (service method, schema, and endpoint constant already
  exist — dormant). It is a normal authenticated route (not a `PUBLIC_PATHS` entry): reachable by
  any signed-in user regardless of `mustChangePassword` state, unreachable without a session like
  any other protected route. It does not use the full dashboard shell (no sidebar) — the user is
  meant to be confined to it, not navigating elsewhere.
- **Reactive redirect on `403 PASSWORD_CHANGE_REQUIRED`**: the axios response interceptor
  (`src/lib/api/axios.ts`) detects this specific `403` on any request and dispatches a window
  event, the same pattern already used for `auth:session-expired`; a listener (alongside the
  existing `auth:session-expired` one) navigates to `/change-password`, carrying the current path
  so the user returns to it after changing their password. On successful change, navigate to the
  captured path (or `/`). This needs no new field on `AuthUser`, the JWT, or the login response —
  the backend proposal only puts `mustChangePassword` in server-side request context
  (`JwtAccessStrategy.validate()`), not the JWT payload or login response body, and the guard
  already blocks every non-allowlisted call, so the very next API call surfaces it reliably.
- **Fix `authService.changePassword`**: it currently forwards the whole `ChangePasswordData`
  object, including the client-only `confirmPassword` field, straight to the backend. The
  backend's global `ValidationPipe` runs with `forbidNonWhitelisted: true` — an unexpected
  `confirmPassword` key would make every change-password call fail with a `400`. Strip it before
  the request.
- **Employee create form — provisioning notice**: after a successful `POST /employees`, show a
  toast/notice telling the Admin a login account was auto-created with the phone number as the
  default password, and that the employee will be asked to change it on first login. No new form
  field (the phone number the Admin already enters *is* the password).
- Update the stale `endpoints.ts` comment ("REGISTER/CHANGE_PASSWORD/FORGOT_PASSWORD/
  RESET_PASSWORD don't exist on the backend") once `CHANGE_PASSWORD` is live — it will no longer
  be accurate for that one endpoint.

## Capabilities

### New Capabilities
- `forced-password-change`: detecting a backend-signaled forced password change, confining the
  session to `/change-password` until it's resolved, and the change-password form itself.

### Modified Capabilities
- `employee-management`: employee creation now also surfaces that a login account was
  auto-provisioned and what its default password is.

## Impact

- New: `src/app/change-password/page.tsx` (+ minimal layout, no `AppSidebar`).
- `src/lib/api/axios.ts` — detect `403 PASSWORD_CHANGE_REQUIRED`, dispatch a new window event.
- `src/features/auth/context/AuthContext.tsx` — listen for that event, redirect (mirrors the
  existing `auth:session-expired` listener).
- `src/features/auth/services/auth.service.ts` — fix `changePassword` to not forward
  `confirmPassword`.
- `src/lib/api/endpoints.ts` — comment update once the endpoint is confirmed live.
- `src/features/employee/hooks/useEmployeeMutations.ts` / employee create flow — provisioning
  notice on success.
- **Cross-repo contract gap to resolve when the backend's `design.md` is written**: the exact JSON
  shape of the `403`'s distinct error code (e.g. a `code`/`error` field vs. a specific `message`
  string) isn't pinned down yet on the backend side. This proposal's spec is written in terms of
  observable behavior ("distinctly identifiable from an ordinary 403"), not a specific field name,
  so it isn't invalidated by that detail being settled later — but the frontend's actual detection
  logic can't be implemented until it is.
