## Context

An admin provisions an employee with a temporary password. The product rule is that such a user must
replace it before using the app. As verified on 2026-09-03, this frontend implements no part of that
rule: there is no `/change-password` route, no `PASSWORD_CHANGE_REQUIRED` handling in
`src/lib/api/errors.ts` or `src/lib/api/axios.ts`, no `auth:password-change-required` event, and no
`mustChangePassword` field on `AuthTokens` or `AccessTokenClaims`. `login()` in `AuthContext.tsx`
navigates unconditionally to the resolved `returnUrl` or `/`.

The constraints that shape the design are all pre-existing properties of this codebase:

- **There is no `/auth/me` endpoint.** `authService.getStoredUser()` re-derives `AuthUser` by
  decoding the `access_token` cookie on every mount. Anything the client must know about the user
  across reloads has to live in the token.
- **`middleware.ts` already decodes the token** — `isTokenExpired()` calls `decodeJwt` on every
  matched request — so a server-side claim check adds no new dependency and no new cost class.
- **`decodeJwt` does not verify signatures** (documented in `src/lib/utils/jwt.ts`); the frontend
  has no signing secret. Every client-side check here is a UX gate, not a security boundary.
- **`changePasswordSchema` and `authService.changePassword()` already exist and are unused.** The
  form work is wiring, not new plumbing.
- The interceptor already models "broadcast an event, let `AuthContext` own the navigation" for
  `auth:session-expired`. The new path should mirror it rather than invent a second style.

## Goals / Non-Goals

**Goals:**

- A user flagged `mustChangePassword` cannot reach any app screen except `/change-password`,
  including via direct URL entry, bookmark, or full page reload.
- The gate is knowable synchronously at login and on every request, not only after some API call
  happens to be rejected.
- Ship safely ahead of the backend: with no claim present, every new check no-ops and current
  behaviour is unchanged.
- Reuse the existing `auth:session-expired` event pattern, `resolveReturnUrl`/`buildReturnUrl`
  helpers, and the `Form` + `zodResolver` component convention rather than adding parallel
  mechanisms.

**Non-Goals:**

- Fixing the weak temp-password generation itself. That is a backend concern
  (`harden-initial-employee-password-provisioning`) and is the actual account-takeover risk; this
  change is the enforcement half.
- Giving `src/app/(dashboard)/page.tsx` real content. Tracked in
  `flesh-out-placeholder-dashboard-pages`. Once the middleware gate exists, the dashboard's
  emptiness no longer affects enforcement, which was the only reason the two were ever coupled.
- Password strength/rotation policy beyond the existing 6-character `changePasswordSchema` minimum.
- Any expiry or grace period on the flag — it is a boolean the backend owns.

## Decisions

### The flag travels as a JWT claim, not a login response field

`mustChangePassword` goes into the access token payload, surfaced on `AccessTokenClaims` and
`AuthUser`.

*Alternative considered — add it to the `POST /auth/login` response body.* Rejected: the flag would
be known only in the `login()` call's local scope. On the next page reload `AuthProvider`'s mount
effect re-derives the user from the cookie via `getStoredUser()` and the flag would be gone,
silently reopening the gate — the exact failure mode this change exists to close. It is also
invisible to `middleware.ts`, which sees cookies and nothing else, ruling out the server-side gate
entirely.

*Alternative considered — both claim and body field.* Rejected as redundant: the claim is available
at the same moment the body would be, since `authService.login()` already decodes the token it just
received before returning.

The cost is coupling the flag's freshness to token lifetime: a user who changes their password still
holds a token asserting `mustChangePassword: true` until it is replaced. That is handled explicitly
by the release step below.

### `middleware.ts` is the primary gate; the login check is a fast path

Enforcement lives in three places, in descending order of authority:

1. **`middleware.ts`** — runs on every matched request, sees the cookie, catches direct URL entry,
   bookmarks, and reloads. This is what actually closes the hole.
2. **`login()`** — avoids a redirect round-trip on the one navigation the client already controls.
   Nice to have, not load-bearing.
3. **The 403 interceptor branch** — a fallback for a session holding a token minted before the claim
   shipped.

*Alternative considered — client-side only (`login()` plus the interceptor).* Rejected: that is the
design the original proposal already described as broken, and reloading the page would escape it.

*Alternative considered — a layout-level guard in `(dashboard)/layout.tsx`.* Rejected: it would not
cover the `(auth)` group, it renders after hydration (so the gated screen flashes), and it
duplicates a check the middleware can do before any bytes ship.

Ordering inside the middleware matters: the existing missing/expired-token branch runs **first**, so
an expired token belonging to a flagged user still goes to `/login`, not to a `/change-password`
screen it has no valid session for.

### `/change-password` is authenticated, not public

It is deliberately kept out of `PUBLIC_PATHS`. Adding it there would let an anonymous request reach
it, and would also trip the existing "authenticated user on a public path → redirect to `/`" rule,
which would bounce a flagged user off the very screen they are being sent to. Instead the flagged
branch treats `/change-password` as its own single allowed destination.

### The release step refreshes the session before navigating

After a successful `POST /auth/change-password`, the stored token still carries
`mustChangePassword: true`. Navigating straight to the destination would have the middleware read
that stale claim and bounce the user back — a loop.

So: if the change-password response returns a fresh token pair, persist it via
`tokenManager.setTokens` and update `AuthContext` state. If it does not, call
`refreshAccessToken()` to mint a token without the claim. Only then navigate, resolving the
`returnUrl` through the existing `resolveReturnUrl` helper so the same-origin check that protects
login applies here too.

*Alternative considered — force a full logout back to `/login`.* Simpler and loop-proof, but it
makes the user type the password they just set, and discards the `returnUrl` they were originally
heading to. Rejected as a worse experience for no security gain.

### The 403 branch does not clear tokens

`auth:password-change-required` is dispatched from the interceptor and handled in `AuthContext`
alongside the existing `auth:session-expired` listener, but with one deliberate difference: it must
not call `tokenManager.clearTokens()` or null out auth state. The session is valid — it is gated,
not expired. Clearing it would send the user to `/login` instead of `/change-password` and lose the
distinction the whole change is drawing.

The discriminator itself is read via a small helper in `src/lib/api/errors.ts` (alongside the
existing `getFieldErrors`), so the exact body shape the backend uses is pinned in one place rather
than inlined in the interceptor.

### Absence of the claim means "not flagged"

Every check reads `claims.mustChangePassword === true`. A token without the key, or an undecodable
one, is not gated. This is what lets the frontend merge before the backend: with no claim in
circulation, all three checks are inert and behaviour is identical to today. It is also the right
failure mode given `decodeJwt` returns `null` on malformed input — the backend guard is the real
boundary, so failing open here costs nothing that the server does not independently enforce.

Note the contrast with `isTokenExpired`, which deliberately fails *closed* on an undecodable token.
That asymmetry is intentional and worth a comment in the code: an unreadable token means "no valid
session" (fail closed), but a readable token missing an optional claim means "backend has not
started sending it yet" (fail open).

## Risks / Trade-offs

- **A user can forge a token payload to clear the flag client-side** → Accepted, not mitigated
  client-side. `decodeJwt` never verifies signatures and this is already true of `role`/`branches`
  in the existing authorization code. The backend's force-password-change guard rejects the request
  regardless, and the 403 interceptor branch pulls the user straight back to `/change-password`.
  This gate is UX enforcement over a server-enforced rule.

- **Redirect loop if the backend guard also rejects `POST /auth/change-password`** → The guard must
  exempt its own endpoint. Called out explicitly in the backend task and worth a manual check
  during verification, since it would make the gate a dead end rather than a detour.

- **Stale claim after a successful change** → Mitigated by the refresh-before-navigate step. If the
  refresh itself fails, the user stays on `/change-password` with an error rather than being
  navigated into a bounce loop.

- **The flag is only as fresh as the access token** → If an admin sets the flag on a user with a
  live session, it takes effect at the next token refresh. The 403 interceptor branch covers the
  interim, which is exactly why it is kept rather than dropped once the middleware gate exists.

- **Middleware decode cost on every request** → Negligible; `isTokenExpired` already decodes the
  same token on the same path. Implementation should decode once and reuse the claims rather than
  calling `decodeJwt` twice.

- **Frontend merged before the backend leaves a visibly unused screen** → `/change-password` is
  reachable by direct URL and functional (it wires an endpoint that already exists), so this is a
  soft edge rather than dead code.

## Migration Plan

1. **Backend first**: add the `mustChangePassword` claim to the access-token signing path; confirm
   the force-password-change guard returns a `PASSWORD_CHANGE_REQUIRED` discriminator and exempts
   `POST /auth/change-password`.
2. **Frontend**: this change. Safe to merge before step 1 lands — all checks no-op without the
   claim.
3. **Verify** with a freshly-provisioned employee: login redirects to `/change-password`; direct
   navigation to `/employees` bounces back; changing the password releases to the original
   destination; a second login goes straight through.

**Rollback**: revert the frontend commit. The backend claim is additive and harmless on its own —
an unrecognized claim in the token payload is ignored by a frontend that does not read it.

## Open Questions - all resolved 2026-09-03

- **`POST /auth/change-password` does exist** on the live backend, despite an earlier pass of this
  document concluding otherwise. That "doesn't exist" finding was based on the checked-in
  `openapi/openapi.json` snapshot (dated 2026-08-26) and a comment in `src/lib/api/endpoints.ts`
  claiming it was dropped — both stale. A local backend became reachable during this session and a
  live call confirmed the endpoint is real: it whitelist-validates its body (400s on an unknown
  `confirmPassword` property) and returns 401 with `"Current password is incorrect"` on a wrong
  current password. `authService.changePassword()` was sending the raw form data including
  `confirmPassword` straight through - a real bug, not just an untested path - fixed to send only
  `{ currentPassword, newPassword }`. Lesson: `openapi.json` and code comments in this repo can lag
  the actual backend; a live call, or the backend source itself, is more trustworthy than either
  when reachable.

Every question below was answered by reading `staffhub-backend` directly - it turned out to be
checked out locally (`C:\_hub\berd\berd.em-backend`) and running as a local process this whole
time, which is also what made every live test in this section possible. Kept for the trail; none
of these are open anymore.

- ~~Does the change-password endpoint return a fresh token pair?~~ **No.** Confirmed both by
  reading `auth.controller.ts` (`changePassword()` returns `{ message: 'Password changed
  successfully.' }`, nothing else) and by a live call. The refresh-after approach in
  `changePassword()` (task 5.2) is required, not just a defensive fallback.
- ~~What exact body shape does the guard's 403 use?~~ **`{ statusCode, message, source, details: {
  code: "PASSWORD_CHANGE_REQUIRED" }, timestamp }`.** `ForcePasswordChangeGuard`
  (`src/modules/auth/guards/force-password-change.guard.ts`) throws a `ForbiddenException` with
  `details: { code: 'PASSWORD_CHANGE_REQUIRED' }`; `GlobalExceptionFilter` forwards `details`
  verbatim. Confirmed live against a real flagged session. `errors.ts`'s
  `isPasswordChangeRequired()` was narrowed from defensive multi-key guessing to
  `data?.details?.code === "PASSWORD_CHANGE_REQUIRED"` to match.
- ~~Is there a live path to provision a flagged password-auth user?~~ **Yes - `POST /employees`,
  not `POST /users`.** The earlier attempt to answer this used the wrong endpoint: a `POST
  /users`-created account is Zalo-login-only and can never be flagged. `POST /employees` creates a
  linked `User` with a real one-time password (`temporaryPassword` in the response) and
  `mustChangePassword: true` set at creation (`employee.service.ts`), exactly matching this
  proposal's premise of "an admin provisions an employee with a temporary password." Confirmed
  end-to-end: provisioned a real flagged employee, logged in as it, triggered the guard, called
  `change-password` while flagged (confirming the `@AllowWhilePasswordChangeRequired()` exemption on
  that route), and confirmed a fresh login afterward decodes `mustChangePassword: false` with normal
  access restored. Test employee and its linked user were deleted afterward - no lasting data.
