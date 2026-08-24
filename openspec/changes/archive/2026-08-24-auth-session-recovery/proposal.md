## Why

Two gaps remain in the existing session-recovery flow. First, when a session truly expires (no refresh token, or the refresh call itself fails), `AuthContext`'s `auth:session-expired` handler navigates straight to `/login` with no `returnUrl`, so the user loses their place. Second, the `returnUrl` that does exist (set by `middleware.ts` on a blocked page load, or read back by `AuthContext.login`) only carries the pathname and is never validated, so query parameters are dropped and a crafted `returnUrl` could redirect off-site after login. The transparent-refresh mechanism itself (401 detection, single in-flight refresh, request queueing, retry) is already implemented and working; this change closes the return-URL gaps around it.

## What Changes

- Add a shared "safe return URL" helper that builds an internal-only relative URL (pathname + query + hash) from the current location, and validates/sanitizes a `returnUrl` value read back from the login page (rejects absolute/external URLs, protocol-relative URLs, and anything that isn't a same-origin path).
- Update the `auth:session-expired` handler in `AuthContext` to capture the current full path (pathname + search + hash) before redirecting to `/login`, so the route the user was on survives a forced logout triggered mid-session by an unrecoverable 401.
- Update `middleware.ts` to include the query string (not just the pathname) when building `returnUrl` for a server-side redirect to `/login`.
- Update `AuthContext.login`'s post-login redirect to validate the `returnUrl` query param with the new helper before navigating, falling back to the existing default destination (`/`) when it is missing or unsafe.

## Capabilities

### Modified Capabilities
- `auth`: session-expiry handling must preserve the current route as a validated `returnUrl` before redirecting to `/login`, and login must only honor safe, same-origin `returnUrl` values when redirecting back.

## Impact

- `src/features/auth/context/AuthContext.tsx` — `auth:session-expired` handler, `login`'s redirect logic.
- `src/middleware.ts` — `returnUrl` construction on the server-side redirect.
- New shared helper (e.g. `src/lib/utils/returnUrl.ts`) used by both the client-side context and reused conceptually by the middleware (middleware runs on the edge runtime, so it builds its own `returnUrl` string but follows the same shape/validation rules).
- No changes to `src/lib/api/axios.ts` (401 detection, refresh queueing/retry) or `auth.service.ts` — the existing transparent-refresh mechanism is reused as-is.
