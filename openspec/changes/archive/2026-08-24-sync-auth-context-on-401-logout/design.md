## Context

`src/lib/api/axios.ts` is a plain module (not a React component/hook) that owns the response interceptor and `tokenManager`. `src/features/auth/context/AuthContext.tsx` (`AuthProvider`) owns the React-visible `user`/`accessToken`/`refreshToken` state and the `logout()` flow (toast + `router.push('/login')`). Today the interceptor's two terminal 401 branches (no refresh token; `POST /auth/refresh` itself fails) call `tokenManager.clearTokens()` and then `window.location.href = '/login'` directly — a full page reload that "fixes" the stale state by blowing away the whole React tree, rather than by keeping it in sync.

The interceptor has no reference to `AuthProvider` (it can't call a hook from a plain module), so some signaling mechanism is needed to cross that boundary.

## Goals / Non-Goals

**Goals:**
- When the interceptor gives up on a 401 (no refresh token, or refresh call fails), `AuthContext`'s `user`/`accessToken`/`refreshToken` state is cleared as part of the same logical logout, not left stale until an unrelated hard reload catches up.
- Centralize the "give up and log out" redirect in `AuthContext`, consistent with the existing `logout()` function, instead of duplicating a raw `window.location.href` in the interceptor.

**Non-Goals:**
- Not changing the happy-path refresh/retry/queueing behavior (single in-flight refresh, queued concurrent 401s) — only the terminal failure branches.
- Not adding new user-facing messaging (e.g. a "session expired" toast) — out of scope for this change; can be layered on later since the event hook gives `AuthContext` a place to do it.
- Not touching the `/auth/refresh` request-body double-key workaround or `authService.refreshToken()` — unrelated existing behavior.

## Decisions

**Bridge mechanism: a `window` `CustomEvent`, not a shared callback registry or a state library.**
`axios.ts` dispatches `window.dispatchEvent(new Event('auth:session-expired'))` after clearing tokens; `AuthProvider` adds a `window.addEventListener('auth:session-expired', ...)` in a `useEffect` on mount and removes it on unmount. This was chosen over:
- A module-level callback (`let onSessionExpired: (() => void) | null`) registered by `AuthProvider` — works, but is a bespoke single-subscriber pattern for something the platform already provides via events, and is easy to leave `null` if `AuthProvider` isn't mounted yet.
- Pulling in a state/pubsub library (zustand store, mitt, etc.) — the codebase already uses zustand elsewhere, but reaching for a dependency/store for a single one-shot signal is overkill next to a plain `CustomEvent`.
`window` events also naturally guard themselves against SSR (the interceptor and the listener both only run client-side, matching the existing `typeof window !== 'undefined'` guards already in `axios.ts`).

**Redirect ownership moves to `AuthContext`.**
The interceptor stops calling `window.location.href = '/login'` in the two terminal branches; the `auth:session-expired` handler in `AuthProvider` clears state and calls `router.push('/login')`, mirroring the existing `logout()` function. This makes `AuthContext` the single place that decides how a logout is presented (React Router navigation vs. hard reload), rather than splitting that decision across two files.

**No `returnUrl` on the forced redirect.**
The existing `logout()` flow doesn't attach one either; keeping the forced-logout path consistent with it rather than inventing new behavior here.

## Risks / Trade-offs

- [`AuthProvider` not yet mounted when the event fires] → In practice `AuthProvider` wraps the whole app in `src/app/providers.tsx`, so it's mounted before any authenticated request can be in flight. No mitigation needed beyond noting the assumption.
- [Event listener leaks or double-fires under React 19 double-invoke in dev] → Standard `useEffect` cleanup (`removeEventListener` on unmount) handles this the same way any other subscription in the codebase would.
- [Silent logout with no explanation] → Already true today (hard redirect gives no message either); explicitly a non-goal here, not a regression.

## Migration Plan

No data migration. Deploy as a normal frontend change:
1. Add the event dispatch in `axios.ts`'s two terminal 401 branches, removing the direct `window.location.href` calls there.
2. Add the listener + forced-logout handler in `AuthContext.tsx`.
Rollback is a plain revert — no persisted state or schema is touched.

## Open Questions

None.
