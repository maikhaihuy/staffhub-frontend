## Why

When the axios response interceptor (`src/lib/api/axios.ts`) hits a 401 it can't recover from (refresh token missing, or `POST /auth/refresh` itself fails), it clears cookies and forces a hard `window.location.href = '/login'` navigation directly from the interceptor. `AuthContext`'s in-memory `user`/`accessToken`/`refreshToken` state is never cleared and the normal `logout()` flow (toast, `router.push`) is bypassed, so any component that reads `useAuth()` during the moment between the 401 and the full page reload sees a stale "authenticated" user.

## What Changes

- Axios interceptor no longer clears tokens and redirects itself on unrecoverable 401 (no refresh token, or refresh call fails). Instead it broadcasts a `window` `CustomEvent` (`auth:session-expired`) and lets `AuthContext` own the logout.
- `AuthProvider` subscribes to `auth:session-expired` on mount and reacts by clearing its `user`/`accessToken`/`refreshToken` state, clearing stored tokens, and redirecting to `/login` via `router.push` (consistent with the existing `logout()` flow), instead of the interceptor's raw hard navigation.
- No change to the happy-path refresh-and-retry behavior (single in-flight refresh, queued concurrent 401s) — only the terminal "give up and log out" path is rewired.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `auth`: the "Expired access tokens are refreshed transparently" requirement's unrecoverable-401 behavior changes from an interceptor-owned hard redirect to an `AuthContext`-owned state clear + redirect, triggered via a `window` event.

## Impact

- `src/lib/api/axios.ts`: response interceptor's two failure branches (missing refresh token, failed refresh call) replace `tokenManager.clearTokens(); window.location.href = '/login'` with `tokenManager.clearTokens()` + dispatching `auth:session-expired`.
- `src/features/auth/context/AuthContext.tsx`: add a `useEffect` that listens for `auth:session-expired` and clears context state + redirects.
- No API, schema, or dependency changes.
