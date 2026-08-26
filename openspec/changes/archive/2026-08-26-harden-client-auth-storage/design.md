## Context

See proposal.md - Why. Relevant current-state details:

- `tokenManager` in [axios.ts](src/lib/api/axios.ts) writes `access_token`/`refresh_token` via
  `js-cookie` with no options object at all (no `Secure`, no `SameSite`, no explicit `expires` -
  they default to session cookies).
- `tokenManager.setUser`/`getUser` mirror the decoded user object into `localStorage['user']` as
  plaintext JSON; `authService.getStoredUser()` just reads it back.
- `AuthContext` mounts by calling `authService.getStoredUser()` (the localStorage read) rather
  than decoding the access token cookie directly, even though `auth.service.ts` already has
  `userFromAccessToken(accessToken)` used on login/refresh.
- Login, register, and forgot-password are plain form submits to this app's own routes (`src/app/
  (auth)/`) - no external identity provider redirects into this app. The separate Zalo Mini App
  repo handles Zalo-specific auth and is out of scope here (CLAUDE.md). So there is no cross-site
  POST that depends on the auth cookies being sent with a top-level cross-origin navigation.

## Goals / Non-Goals

**Goals:**
- Auth cookies carry `SameSite=Strict` always, and `Secure` in production, without breaking local
  HTTP dev (`pnpm dev` on `localhost:3016`).
- The decoded user object exists only in memory (React state) for the tab's lifetime; nothing
  about the user is written to `localStorage` (or any other persistent client storage).
- On mount, `AuthContext` re-derives the user from the `access_token` cookie instead of reading a
  cached object.

**Non-Goals:**
- Not moving tokens themselves out of cookies (they must stay cookie-based for `middleware.ts` to
  read them server-side - see the existing "Login issues and persists tokens" requirement).
- Not changing the refresh-token rotation flow, the `auth:session-expired` event contract, or the
  dual `refreshToken`/`refresh_token` body-casing workaround - all orthogonal to storage hardening.
- Not adding httpOnly cookies / server-set-cookie flows (would require backend changes to issue
  `Set-Cookie` itself instead of the SPA calling `Cookies.set`); out of scope for this change.

## Decisions

### `SameSite=Strict` (not `Lax`)
No flow in this repo sends the auth cookies as part of a cross-site top-level navigation (no
external OAuth-style redirect lands on an authenticated page here - see Context). `Strict` is
the tighter default and CSRF-hardens the cookie without breaking any existing flow. If a future
cross-site redirect into an authenticated page is added, this decision should be revisited.

### `Secure` gated on `process.env.NODE_ENV === 'production'`, not always-on
Dev runs over plain HTTP (`pnpm dev`, port 3016). An always-on `Secure` flag would silently drop
the cookie in local dev (browsers refuse to store `Secure` cookies over HTTP), breaking auth
entirely for every contributor. Gating on `NODE_ENV` matches the behavior the original `// secure:
true khi production` comment in `axios.ts` already intended but never wired up.

### Re-derive user from the access-token cookie on mount, don't cache it
`auth.service.ts` already has `userFromAccessToken(accessToken)`, used identically on login and
refresh. Reusing it in `AuthContext`'s mount effect (`userFromAccessToken(tokenManager
.getAccessToken())`) removes the need for `tokenManager.setUser`/`getUser`/localStorage entirely -
one code path derives the user everywhere (login, register, refresh, mount), instead of two
(decode vs. read-cached-JSON) that could silently diverge. `tokenManager.clearTokens()` no longer
needs to `localStorage.removeItem('user')` since nothing writes there anymore.

Alternative considered: keep a session-only cache (`sessionStorage`) instead of pure in-memory
state, to avoid a re-decode on every mount. Rejected - the decode is a cheap synchronous JWT
parse (already happens on every login/refresh), and `sessionStorage` is still readable by any
script on the page, so it doesn't materially improve on the plaintext-`localStorage` problem this
change is fixing.

## Risks / Trade-offs

- **[Risk]** Removing the `localStorage` user cache means a hard page reload always re-decodes
  the user from the access-token cookie instead of an instant synchronous read → **Mitigation**:
  the decode is synchronous and local (no network call); `AuthContext`'s existing `isLoading` gate
  already covers this window, so no new loading state is needed.
- **[Risk]** `SameSite=Strict` cookies are not sent on a link click arriving from an external site
  (e.g. an email or chat link straight into a deep authenticated URL) → **Mitigation**: accepted
  for this app; `middleware.ts` already redirects the missing-cookie case to `/login?returnUrl=...`,
  so the user just has to log in once rather than being silently broken.
- **[Trade-off]** This still doesn't make tokens inaccessible to XSS (they're non-httpOnly cookies
  readable via `document.cookie`) - full mitigation would require the backend to set httpOnly
  cookies itself, which is out of scope (see Non-Goals). This change narrows the blast radius
  (cross-site leakage, plaintext user data at rest) without eliminating same-origin XSS risk.

## Migration Plan

No data migration needed (no server-side schema, no persisted records). Rollout is a single
frontend deploy:
1. Ship the `tokenManager`/`AuthContext` changes together (they're interdependent - `AuthContext`
   stops calling `setUser`/`getUser`).
2. Existing logged-in users: their current session cookies lack the new attributes until they
   next log in, refresh, or the cookie naturally expires (session cookies today, per Context) -
   next `setTokens` call (e.g. on the next token refresh) rewrites them with the hardened
   attributes. No forced logout is required.
3. Rollback is a plain revert - no persisted state format changes, so no backward-compat shim is
   needed either direction.
