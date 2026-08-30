## Why

`middleware.ts` redirects to `/login` the moment `access_token` is missing **or expired**, without
ever looking at `refresh_token`. The axios response interceptor already refreshes an expired
access token silently (see `auth` spec, "Expired access tokens are refreshed transparently") — but
only in reaction to a `401` from an in-page API call. Server-side navigation (a full page load, or
any App Router request middleware intercepts) never reaches that interceptor, so a user who is
simply idle for longer than the short-lived access token's TTL and then clicks to a new page gets
force-logged-out and sent to `/login`, even though their `refresh_token` is still valid and a
silent refresh would have succeeded had they instead stayed put and triggered any API call. The
same "expired access token" condition is recoverable mid-session but fatal on navigation — that
inconsistency is the bug.

## What Changes

- `middleware.ts` no longer treats an expired `access_token` as equivalent to "no session." It
  additionally checks `refresh_token`: if `refresh_token` is present and not itself expired, the
  request is allowed through (or, on `/login`, redirected to `/`) instead of being sent to
  `/login` — the client-side axios interceptor performs the actual silent refresh on that page's
  first API call, the same way it already does mid-session.
- Middleware only redirects to `/login` when there is no session to recover: no `access_token` at
  all, or both `access_token` and `refresh_token` are expired/missing.
- No change to the refresh mechanism itself (axios interceptor, `/auth/refresh` call, cookie
  storage) — this is purely about what *routing* decision middleware makes while a refresh is
  still recoverable.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `auth`: the "Unauthenticated or expired access to protected routes is blocked server-side"
  requirement changes from "any missing-or-expired `access_token` blocks the route" to "only a
  missing-or-expired `access_token` **with no recoverable `refresh_token`** blocks the route";
  the "authenticated user hits `/login`" check gains the same refresh_token-aware condition.

## Impact

- `src/middleware.ts` — the route-gating logic itself.
- `src/lib/utils/jwt.ts` — `isTokenExpired` is reused as-is against `refresh_token` too; no change
  expected there, but worth confirming refresh tokens are JWTs with a decodable `exp` claim (same
  as access tokens) before relying on it.
- No backend change required.
- No change to `AuthContext`, the axios interceptor, or cookie storage — they already do the right
  thing once a page actually loads and issues an API call.
