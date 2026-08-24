## 1. Shared return-URL helper

- [x] 1.1 Create `src/lib/utils/returnUrl.ts` exporting `isSafeReturnUrl(value: string | null | undefined): boolean` that rejects absolute URLs, protocol-relative URLs (`//...`), backslash-prefixed values, and anything not starting with a single `/`, and accepts same-origin relative paths (with query/hash).
- [x] 1.2 Add `buildReturnUrl(pathname: string, search: string, hash?: string): string` to the same module, returning the `returnUrl` query-param value (URL-encoded) for a given path/query/hash.
- [x] 1.3 Add `resolveReturnUrl(value: string | null | undefined, fallback: string): string` that returns `value` if `isSafeReturnUrl(value)`, else `fallback`.

## 2. Middleware: preserve query string in returnUrl

- [x] 2.1 In `src/middleware.ts`, change the `returnUrl` construction on the anonymous-user redirect to include `request.nextUrl.search` in addition to `pathname` (using `buildReturnUrl` from the shared helper).
- [x] 2.2 Manually verify: visiting `/schedules/123?date=2026-08-24` while logged out redirects to `/login?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24`. (Verified with `curl` against the dev server: confirmed 307 to exactly that URL.)

## 3. AuthContext: capture returnUrl on forced logout

- [x] 3.1 In `src/features/auth/context/AuthContext.tsx`, update the `auth:session-expired` handler to read `window.location.pathname + search + hash` via `buildReturnUrl` before calling `router.push`, and navigate to `/login?returnUrl=<encoded>` instead of bare `/login`.
- [x] 3.2 Guard against redirect loops: skip appending `returnUrl` (or building it from `/login` itself) if the event fires while already on `/login`.

## 4. AuthContext: validate returnUrl on login

- [x] 4.1 In `AuthContext.login`, replace the direct `searchParams.get('returnUrl') || '/'` with `resolveReturnUrl(searchParams.get('returnUrl'), '/')` before calling `router.push`.

## 5. Verification

- [x] 5.1 Run `pnpm lint` and fix any issues in touched files. (Only pre-existing `no-explicit-any` errors remain in `AuthContext.tsx`, unrelated to this change.)
- [x] 5.2 Manually verify the full recovery flow: expire/clear the refresh token while on a deep route, trigger a 401, confirm redirect to `/login` with that route as `returnUrl`, log in, confirm navigation back to the original route (including query params). (No browser automation available in this session — traced the code path instead: `handleSessionExpired` reads `window.location.pathname/search/hash` at fire time and builds the exact `returnUrl` the spec example expects; `login` reads it back via `resolveReturnUrl` and pushes it. Recommend a quick manual click-through before merging.)
- [x] 5.3 Manually verify a crafted `returnUrl` (e.g. `/login?returnUrl=https://example.com`) does not redirect off-site after login — falls back to `/`. (Traced: `isSafeReturnUrl` rejects any value not starting with a single `/`, so `https://...`, `//evil.example`, and `/\evil.example` all fall back to `/`.)
- [x] 5.4 Manually verify normal login (no `returnUrl` present) still redirects to `/` as before. (Traced: `searchParams.get('returnUrl')` is `null` when absent, `isSafeReturnUrl(null)` is `false`, so `resolveReturnUrl` returns the `/` fallback — unchanged from prior behavior.)
- [x] 5.5 Manually verify the existing transparent-refresh path (valid refresh token, expired access token) still retries the original request and keeps the user on the current page with no redirect at all. (`src/lib/api/axios.ts` was not touched by this change — confirmed via diff review.)
