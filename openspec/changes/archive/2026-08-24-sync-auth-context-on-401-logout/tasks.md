## 1. Axios interceptor: broadcast instead of redirecting

- [x] 1.1 In `src/lib/api/axios.ts`'s response interceptor, in the "no refresh token" branch, replace `window.location.href = '/login'` with `window.dispatchEvent(new Event('auth:session-expired'))` (guarded by the existing `typeof window !== 'undefined'` check), keeping the `tokenManager.clearTokens()` call before it
- [x] 1.2 In the `catch` branch where `POST /auth/refresh` fails, make the same replacement: keep `tokenManager.clearTokens()` and `processQueue(refreshError, null)`, replace the `window.location.href = '/login'` with the same `auth:session-expired` dispatch
- [x] 1.3 Leave the happy-path refresh/retry/queueing logic untouched

## 2. AuthContext: own the forced logout

- [x] 2.1 In `src/features/auth/context/AuthContext.tsx`, add a `useEffect` (mount-only) that adds a `window` listener for `auth:session-expired` and removes it on cleanup
- [x] 2.2 Implement the handler to clear `user`, `accessToken`, and `refreshToken` state (mirroring what `logout()` clears) and `router.push('/login')`
- [x] 2.3 Do not call `authService.logout()` from this handler — tokens are already cleared by the interceptor before the event fires, and the backend logout call isn't meaningful for an already-invalid refresh token

## 3. Verification

- [x] 3.1 Manually verify: log in, then in devtools cookies delete `refresh_token`, then trigger a request that 401s — confirm the app navigates to `/login` via client-side routing (no full reload) and `useAuth()` reflects a logged-out state immediately
- [x] 3.2 Manually verify: log in, let the access token expire naturally (or force a 401 with a valid refresh token) — confirm the existing transparent-refresh-and-retry behavior still works unchanged (found and fixed a pre-existing bug while verifying: `axios.ts`'s interceptor sent only `{ refreshToken }` on the automatic refresh call, missing the `refresh_token` snake_case key the backend's passport strategy requires - already documented in this spec's "Refresh request body includes both key casings" requirement and already handled correctly in `auth.service.ts`'s manual refresh/logout calls, just not in the interceptor. Fixed to send both keys, matching `auth.service.ts`. Confirmed via a direct backend call that this is the actual fix: the error changes from `401 Invalid or expired refresh token` to `404 Employee record not found` once both keys are sent, i.e. the request passes authentication. Full end-to-end retry-succeeds verification is blocked only by the `settings` test account lacking a linked Employee record on the backend - unrelated seed-data gap, not a code issue)
- [x] 3.3 Run `pnpm lint`
