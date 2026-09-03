## Why

A freshly-provisioned employee is issued a temporary password by an admin. Until they replace it,
their account is a standing risk — the temp password is weak by construction and may be known to
whoever provisioned it. The intended product rule is "you must change your password before you can
do anything else."

**That rule is not enforced anywhere in this frontend today.** An earlier draft of this proposal
assumed a *reactive* gate already existed (an axios interceptor watching for a
`PASSWORD_CHANGE_REQUIRED` 403, dispatching `auth:password-change-required`, redirecting to
`/change-password`) and framed the work as tightening it. Re-verification against the repo on
2026-09-03 found none of that is real:

- No `PASSWORD_CHANGE_REQUIRED` constant in `src/lib/api/errors.ts` (the file is 21 lines and
  handles only 400-level field errors); `git log -S` finds the string in no commit on any branch.
- No `auth:password-change-required` event is dispatched or listened for anywhere.
  `AuthContext.tsx` handles only `auth:session-expired`.
- No `/change-password` route exists. `src/app/(auth)/` contains only `login`, `register`, and
  `forgot-password` (the last is an empty file).
- No `forced-password-change` capability exists in `openspec/specs/`, and no
  `handle-forced-password-change-and-employee-account-notice` change is in `openspec/changes/archive/`.

What *is* true: `login()` in `AuthContext.tsx` redirects straight to the `returnUrl` or `/` with no
flag check of any kind, and neither `AuthTokens` nor `AccessTokenClaims`
(`src/features/auth/types/auth.type.ts`) carries a `mustChangePassword` field — so the frontend has
no way, synchronous or reactive, to even learn that a user is flagged.

So there is no gate window to narrow. There is no gate. This change builds one.

## What Changes

- **Backend companion change required (blocker)**: add a `mustChangePassword` boolean claim to the
  access token payload. A claim rather than a login-response field is deliberate — this app derives
  the current user by decoding the `access_token` cookie on every mount (there is no `/auth/me`
  endpoint; see the "Current user is derived from the access token" requirement in `specs/auth`).
  A response-body-only field would be known in memory immediately after login and then lost on the
  first page reload, silently reopening the gate. A claim survives reload and is refreshed naturally
  by the existing token-refresh path.
- Add a **`/change-password` page** under `src/app/(auth)/` with a `ChangePasswordForm` feature
  component. `changePasswordSchema` and `authService.changePassword()` already exist and are
  currently unused — this wires them to a screen. Vietnamese copy, per project convention.
- **Proactive gate at login**: `login()` checks the decoded `mustChangePassword` claim and redirects
  to `/change-password` instead of the `returnUrl`/`/`, preserving the original `returnUrl` so the
  user lands where they meant to go once the password is changed.
- **Server-side gate in `middleware.ts`**: a request carrying an access token whose
  `mustChangePassword` claim is true is redirected to `/change-password` for any path other than
  `/change-password` itself. This is what actually closes the hole — it holds for direct URL entry,
  bookmarks, and full page reloads, none of which run `login()`.
- **Reactive fallback**: the axios response interceptor recognizes a `PASSWORD_CHANGE_REQUIRED` 403
  from the backend's guard and dispatches `auth:password-change-required`, which `AuthContext`
  turns into the same redirect. Defense in depth for sessions holding a token minted before the
  claim existed.
- On successful password change, the new token pair (with the claim cleared) is stored and the user
  is released to their original destination.
- **Out of scope**: `src/app/(dashboard)/page.tsx` is an unmodified Next.js scaffold. Giving it real
  content is tracked separately in the `flesh-out-placeholder-dashboard-pages` change; with a
  middleware gate the dashboard's emptiness no longer affects enforcement.

## Capabilities

### New Capabilities
- `forced-password-change`: the end-to-end gate that keeps a user flagged `mustChangePassword`
  confined to the change-password screen — how the flag reaches the frontend, the three enforcement
  points (login redirect, middleware, reactive 403), the change-password screen itself, and the
  release path once the password is replaced.

### Modified Capabilities
- `auth`: the "Login issues and persists tokens" requirement currently mandates an unconditional
  redirect to `returnUrl` or `/`; it needs a carve-out for the flagged case. The "Current user is
  derived from the access token" requirement lists the claims decoded from the token and needs
  `mustChangePassword` added. The "Unauthenticated access to protected routes is blocked
  server-side" requirement describes `middleware.ts`'s full redirect behaviour and needs the
  flagged-user branch.

## Impact

- **Backend (`staffhub-backend`, separate repo — must land first)**: add `mustChangePassword` to the
  access token claims in the JWT signing path, and ensure the existing force-password-change guard
  returns a `PASSWORD_CHANGE_REQUIRED` discriminator in its 403 body.
- **Frontend — new files**: `src/app/(auth)/change-password/page.tsx`,
  `src/features/auth/components/ChangePasswordForm.tsx`,
  `src/features/auth/hooks/useChangePassword.ts`.
- **Frontend — modified**: `src/features/auth/types/auth.type.ts` (`AccessTokenClaims`, `AuthUser`),
  `src/features/auth/services/auth.service.ts` (`userFromAccessToken`, `changePassword` return
  shape), `src/features/auth/context/AuthContext.tsx` (`login()`, new event listener),
  `src/middleware.ts` (flagged-user branch, `/change-password` added to the public-path handling),
  `src/lib/api/errors.ts` (403 discriminator helper), `src/lib/api/axios.ts` (403 branch in the
  response interceptor).

**Cross-repo sequencing**: this cannot be fully applied frontend-only. Land the backend claim first;
until then the middleware and login checks read `undefined` and correctly no-op, so the frontend
work is safe to merge ahead of it — it simply does nothing until the claim appears.
