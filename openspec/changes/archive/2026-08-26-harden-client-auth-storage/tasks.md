## 1. Harden cookie attributes

- [x] 1.1 In `src/lib/api/axios.ts`'s `tokenManager.setTokens`, set `access_token`/`refresh_token`
      via `Cookies.set(name, value, { sameSite: 'strict', secure: process.env.NODE_ENV === 'production' })`,
      replacing the current no-options calls and the stale commented-out lines.
- [x] 1.2 Confirm `tokenManager.clearTokens`'s `Cookies.remove('access_token')` /
      `Cookies.remove('refresh_token')` calls still remove the cookies now that they carry
      `sameSite`/`secure` attributes (js-cookie requires matching attributes to remove a cookie
      reliably) - pass the same `{ sameSite: 'strict', secure: ... }` options to `Cookies.remove`
      if needed.

## 2. Remove localStorage user persistence

- [x] 2.1 Delete `tokenManager.setUser` and `tokenManager.getUser` from `src/lib/api/axios.ts`.
- [x] 2.2 Remove the `localStorage.removeItem('user')` line from `tokenManager.clearTokens`.
- [x] 2.3 In `src/features/auth/services/auth.service.ts`, remove the `tokenManager.setUser(user)`
      calls in `login`, `register`, and `refreshToken`, and delete `getStoredUser()` (or reimplement
      it to call `userFromAccessToken(tokenManager.getAccessToken())` if still needed by callers -
      check for other call sites first).

## 3. Re-derive user in AuthContext on mount

- [x] 3.1 In `src/features/auth/context/AuthContext.tsx`'s mount `useEffect`, replace
      `authService.getStoredUser()` with deriving the user directly from the access token (export
      and reuse `userFromAccessToken` from `auth.service.ts`, or call the now-updated
      `authService.getStoredUser()` if task 2.3 kept it as a thin wrapper).
- [x] 3.2 Verify `login`, `register`, and `refreshAccessToken` in `AuthContext` still work
      unchanged - they already set `user` from the service call's return value, not from storage.

## 4. Verify

- [x] 4.1 Run `pnpm dev`, log in, and confirm in devtools Application panel: `access_token`/
      `refresh_token` cookies show `SameSite=Strict` (no `Secure` under local HTTP), and
      `localStorage` has no `user` key.
- [x] 4.2 Build with `pnpm build && pnpm start` (or simulate `NODE_ENV=production`) and confirm the
      cookies additionally show `Secure`.
- [x] 4.3 Reload the app while logged in and confirm the current user (name/role) still renders
      correctly, sourced from decoding the access token rather than a cached object.
- [x] 4.4 Trigger a forced logout (expire/clear the refresh token and make a request) and confirm
      `auth:session-expired` still clears state and redirects to `/login` with the expected
      `returnUrl`, and that both cookies are actually removed afterward.
- [x] 4.5 Run `pnpm lint`.
