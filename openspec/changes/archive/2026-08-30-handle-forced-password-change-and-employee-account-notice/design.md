## Context

`staffhub-backend`'s `auto-provision-user-on-employee-create` (proposal + specs only, no
`design.md`/`tasks.md` yet) will add `mustChangePassword` to `AuthenticatedUserDto`, populated
live per-request in `JwtAccessStrategy.validate()` — **not** baked into the JWT payload or the
login response body. A `ForcePasswordChangeGuard` will reject any authenticated request outside a
small allowlist (change-password, logout, logout-device, logout-all, refresh) with `403` while
the flag is set. See `proposal.md` - Why for the frontend gap this leaves.

This frontend already has the exact reactive pattern needed, for a different failure mode:
`src/lib/api/axios.ts`'s response interceptor dispatches `window.dispatchEvent(new
Event('auth:session-expired'))` on an unrecoverable `401`, and
`src/features/auth/context/AuthContext.tsx` listens for it and redirects, carrying the current
path as `returnUrl` (see `auth` spec, "Current user is derived from the access token"). This
change reuses that exact shape for a `403 PASSWORD_CHANGE_REQUIRED` instead of inventing a new
mechanism.

Already present but dormant/unused: `changePasswordSchema` (`{currentPassword, newPassword,
confirmPassword}` with a `newPassword === confirmPassword` refine) in
`src/features/auth/schemas/auth.schema.ts`, `ChangePasswordData` type, and
`authService.changePassword()` in `src/features/auth/services/auth.service.ts` (currently
forwards the whole object, including `confirmPassword`, to the backend — a latent bug, see
Decisions). `API_ENDPOINTS.AUTH.CHANGE_PASSWORD` already points at `/auth/change-password`.

## Goals / Non-Goals

**Goals:**
- A session flagged `mustChangePassword` on the backend ends up at `/change-password` and can't
  do anything else, using only signals the backend proposal already commits to (the `403` itself)
  — no new backend contract beyond what `auto-provision-user-on-employee-create` already scopes.
- An Admin creating an Employee is told a login account now exists and what its password is.

**Non-Goals:**
- No proactive (pre-first-API-call) detection of `mustChangePassword` — see Decisions for why.
- No UI for backfilling existing Employees with `userId = null` — the backend proposal explicitly
  defers this too.
- No change to the employee create *form* itself (no new field) — the phone number already
  entered is the password.
- Not implementable/testable end-to-end until the backend ships `mustChangePassword` enforcement
  and `POST /auth/change-password` — this change can be built and unit-tested against a mocked
  `403`, but real verification needs the backend piece.

## Decisions

**Decision: detect the forced-password-change state reactively (via the first blocked API call),
not proactively from the login response or JWT.**
The backend proposal only puts `mustChangePassword` in server-side request context
(`JwtAccessStrategy.validate()`) — not the JWT payload (unlike `role`/`branches`/`empId`, which
already are) and not necessarily the login response body. Requiring a proactive frontend check
would need an *additional*, not-yet-scoped backend contract change (adding the flag to the login
response DTO) beyond what `auto-provision-user-on-employee-create` already commits to. Since
`ForcePasswordChangeGuard` blocks every non-allowlisted route, the very first API call the
dashboard makes after login (e.g. sidebar identity, initial list fetch) reliably 403s within one
round trip — reactive detection costs nothing beyond what the existing `auth:session-expired`
pattern already does for a different signal, and needs zero new backend contract.
Alternative considered (and rejected): thread `mustChangePassword` through `authService.login`'s
return shape into `AuthUser`, as an earlier internal draft of this proposal assumed. Rejected
because it bakes in an unconfirmed assumption about the login response shape that the backend
proposal doesn't actually make yet.

**Decision: `/change-password` is a plain authenticated route, not a `PUBLIC_PATHS` entry.**
An earlier draft suggested adding it to `middleware.ts`'s `PUBLIC_PATHS`-adjacent handling.
Rejected: `PUBLIC_PATHS` means "reachable without any session," which `/change-password` is not
— you need a valid access token to call `POST /auth/change-password` at all. It needs no
`middleware.ts` change whatsoever: an authenticated user reaching it falls through to
`NextResponse.next()` like any other protected route already does today. `mustChangePassword`
isn't decodable from the access token, so middleware has no way to gate on it anyway (nor does it
need to, per the reactive-detection decision above).

**Decision: `/change-password` gets its own minimal layout, not the `(dashboard)` shell.**
The user is meant to be confined here, not offered sidebar navigation to other screens they can't
actually use yet (everything else 403s). New top-level route `src/app/change-password/page.tsx`
with a layout that wraps only `AuthGuard` (reused as-is — it already does exactly "redirect to
`/login` if not authenticated, else render") — no `AppSidebar`/`SidebarProvider`.

**Decision: fix `authService.changePassword` to strip `confirmPassword` before the request.**
The backend's global `ValidationPipe` runs `forbidNonWhitelisted: true` (confirmed in
`staffhub-backend/src/main.ts`) — sending the client-only `confirmPassword` field would 400 every
call. One-line destructure fix at the call site.

**Decision: the `403` detection matches on a distinguishing field, not currently pinned down.**
The backend proposal says the `403` gets "a distinct error code identifying that a password
change is required" but doesn't specify the exact JSON shape (a `code`/`error` field vs. a
specific `message` string) — its own `design.md` doesn't exist yet either. This frontend's
interceptor code will need whatever shape the backend actually ships; the spec is written at the
behavior level ("distinctly identifiable from an ordinary 403") so it doesn't need to change once
that's settled, but implementation is blocked on it (see proposal.md - Impact).

**Decision: the provisioning notice is a richer success toast, not a modal.**
`useCreateEmployee` (`src/features/employee/hooks/useEmployeeMutations.ts`) already uses
`useAppMutation`'s `successMessage` for a plain "Employee created" toast. Swap to a custom
`onSuccess` callback (already supported by `useAppMutation`, passed straight through to
`useMutation`) that fires a longer-duration toast with the fuller Vietnamese message, instead of
introducing a new modal/dialog component for a one-line, low-stakes notice — consistent with
"One clear primary action per screen state" and this app's toast-based confirmation pattern
already used everywhere else (`sonner`).

## Risks / Trade-offs

- **[Risk] Reactive-only detection means a flagged user briefly sees whatever page they land on
  post-login before the first API call 403s and redirects them.** → Mitigation: this mirrors the
  exact same trade-off `auth:session-expired` already accepts today for a different signal; the
  window is one API round trip, and nothing sensitive renders without data anyway (React Query
  hooks show loading state until their first response, which is the 403 itself).
- **[Risk] The `403` detection's exact match condition depends on a backend shape not yet
  decided.** → Mitigation: called out explicitly in proposal.md - Impact as a cross-repo
  coordination point; implementation of just this piece should wait for the backend's own
  `design.md`, not guess and risk silently never matching (which would leave flagged users stuck
  seeing generic "Forbidden" toasts on every action with no way out other than reading a support
  ticket).
- **[Trade-off] `/change-password`'s own layout duplicates a little of what `(dashboard)/layout.tsx`
  does (wrapping `AuthGuard`)** rather than reusing the dashboard layout with the sidebar
  conditionally hidden. Accepted: the duplication is one wrapper component reused as-is
  (`AuthGuard` itself is not duplicated), and keeping `/change-password` structurally separate
  from `(dashboard)` avoids ever accidentally rendering sidebar links to routes that would 403 for
  a flagged user.

## Migration Plan

No data migration on this side. Sequencing: this change's specs/design can land now, but the
axios-interceptor/redirect piece specifically should not be implemented until the backend change
ships (proposal.md flags this). The change-password page, form, schema fix, and the employee
create notice have no such dependency and can be built independently. Rollback is a plain revert;
no cookie/schema/endpoint shape changes to unwind on the frontend side.
