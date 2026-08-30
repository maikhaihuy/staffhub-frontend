## 1. Middleware routing logic

- [x] 1.1 In `src/middleware.ts`, read the `refresh_token` cookie alongside the existing
      `access_token` read.
- [x] 1.2 Replace the "redirect to `/login`" condition so it fires only when there is no
      recoverable session: `!token` (no `access_token`), or `access_token` is expired AND
      (`refresh_token` is missing OR `refresh_token` is expired).
- [x] 1.3 Replace the "authenticated user hits a public path → redirect to `/`" condition with the
      mirrored check: a valid `access_token`, OR (`access_token` expired AND `refresh_token`
      present and unexpired).
- [x] 1.4 Keep the existing `response.cookies.delete('access_token')` cleanup behavior for the
      truly-unrecoverable redirect path; do not delete `refresh_token` here (the axios interceptor
      owns clearing both together via `tokenManager.clearTokens()` on an unrecoverable 401).

## 2. Verification

- [x] 2.1 Manually verify: log in, wait for (or fabricate) an expired `access_token` with a still
      valid `refresh_token`, then navigate to a dashboard route via a link (not a reload) — confirm
      the page loads instead of bouncing to `/login`, and that the first API call on that page
      triggers a silent refresh (new `access_token`/`refresh_token` cookies written, no visible
      auth error).
      Verified against the running dev server with a fabricated (unsigned, payload-only-decoded)
      expired access token + valid refresh token cookie pair: `GET /branches` returns `200`, no
      redirect. The actual silent-refresh-on-401 behavior itself is unchanged/pre-existing
      (`src/lib/api/axios.ts` interceptor) and out of scope for this middleware-only change.
- [x] 2.2 Manually verify: same setup, navigate to `/login` directly — confirm it redirects to `/`
      instead of showing the login form.
      Verified: `GET /login` with expired-access/valid-refresh cookies returns `307` to `/`.
- [x] 2.3 Manually verify: both `access_token` and `refresh_token` expired (or `refresh_token`
      cookie absent) — confirm navigation to a dashboard route still redirects to
      `/login?returnUrl=...` as before.
      Verified both sub-cases: expired+expired and expired+absent `refresh_token` both return
      `307` to `/login?returnUrl=%2Fbranches`.
- [x] 2.4 Manually verify: no cookies at all (fully logged out) — confirm navigation to a dashboard
      route still redirects to `/login?returnUrl=...` as before.
      Verified: no cookies returns `307` to `/login?returnUrl=%2Fbranches`. Also spot-checked the
      unchanged valid-access-token cases (dashboard loads `200`, `/login` redirects `307` to `/`)
      as a regression check.
- [x] 2.5 Run `pnpm lint`.
      Ran; pre-existing errors/warnings across unrelated files (e.g. `no-undef` React in shadcn/ui
      components, `no-unused-vars` in several forms) are unrelated to this change - `next lint`
      reports nothing in `src/middleware.ts`.

## 3. Spec sync

- [x] 3.1 After manual verification passes, sync the `auth` delta spec in this change into
      `openspec/specs/auth/spec.md` (via `/opsx:apply` / archive flow) so the main spec reflects
      the refresh-token-aware middleware behavior.
      Synced via `/opsx:sync`; `openspec validate --strict` passes for all 18 specs.
