## 1. Shared authorization primitives

- [x] 1.1 Create `usePageAbility(action, subject)` in `src/lib/hooks/usePageAbility.ts`, built on
      `useAbility()` — returns `{ allowed, isLoading }`.
- [x] 1.2 Create `<RequireAbility action subject>` in `src/components/require-ability.tsx`, using
      `usePageAbility`: renders the existing `AuthGuard` loading spinner while loading, a
      "Bạn không có quyền truy cập trang này" forbidden state when `!allowed`, and `children`
      otherwise.

## 2. Middleware: reject expired/malformed tokens

- [x] 2.1 Add an edge-safe JWT payload decoder + expiry check to `src/lib/utils/jwt.ts` (base64url
      decode only, no signature verification — see design.md Decision 4).
- [x] 2.2 Update `src/middleware.ts` to treat a present-but-expired-or-malformed `access_token` the
      same as a missing one: clear the cookie and redirect to `/login` with `returnUrl` set via the
      existing `buildReturnUrl` helper.
- [x] 2.3 Confirm the existing missing-cookie redirect and the public-path bypass are unchanged by
      re-reading the updated `middleware.ts` against the current behavior.

## 3. `routes.ts` backfill

- [x] 3.1 ~~Add a `/schedules` entry to `ADMIN_ROUTES`~~ — superseded during implementation:
      `schedules/page.tsx` is a deliberately-retired redirect stub (`router.replace("/rosters")`),
      not a feature page; `routes.ts` correctly has no entry for it. See design.md Decision 3.
      No change made.

## 4. Wrap admin management pages

- [x] 4.1 `src/app/(dashboard)/users/page.tsx` — wrap with `<RequireAbility action="read" subject="users">`.
- [x] 4.2 `src/app/(dashboard)/roles/page.tsx` — wrap with `<RequireAbility action="read" subject="roles">`.
- [x] 4.3 `src/app/(dashboard)/roles/[id]/page.tsx` — wrap with `<RequireAbility action="read" subject="roles">`.
- [x] 4.4 `src/app/(dashboard)/permissions/page.tsx` — wrap with `<RequireAbility action="read" subject="permissions">`.
- [x] 4.5 `src/app/(dashboard)/permission-simulator/page.tsx` — wrap with `<RequireAbility action="read" subject="permissions">`.
- [x] 4.6 `src/app/(dashboard)/audit-log/page.tsx` — wrap with `<RequireAbility action="read" subject="audit-logs">`.
- [x] 4.7 `src/app/(dashboard)/branches/page.tsx` — wrap with `<RequireAbility action="read" subject="branches">`,
      keeping the existing inline `ability.can("delete", "branches")` check for the delete button as-is.
- [x] 4.8 `src/app/(dashboard)/employees/page.tsx` — wrap with `<RequireAbility action="read" subject="employees">`.
- [x] 4.9 `src/app/(dashboard)/shifts/page.tsx` — wrap with `<RequireAbility action="read" subject="Shift">`.
- [x] 4.10 `src/app/(dashboard)/shifts/[id]/page.tsx` — wrap with `<RequireAbility action="read" subject="Shift">`.

## 5. Wrap manager scheduling pages

- [x] 5.1 `src/app/(dashboard)/rosters/page.tsx` — wrap with `<RequireAbility action="read" subject="Roster">`.
- [x] 5.2 ~~`src/app/(dashboard)/schedules/page.tsx` — wrap with `<RequireAbility>`~~ — superseded:
      this route is a deliberately-retired redirect stub with no content to gate; the redirect
      fires unconditionally regardless of any wrapper, and its target (`/rosters`) is already
      gated by 5.1. See design.md Decision 3. No change made.
- [x] 5.3 `src/app/(dashboard)/shipLogs/page.tsx` — wrap with `<RequireAbility action="read" subject="ShipLog">`.

## 6. Staff self-service pages (excluded — see design.md Decision 6)

- [x] 6.1 ~~`attendanceTracking/page.tsx` — wrap with `<RequireAbility subject="attendance">`~~ —
      superseded: unbuilt scaffold placeholder in `GENERAL_ROUTES` (no `requiredPermission` by
      convention); its permission model is deferred to `flesh-out-placeholder-dashboard-pages`.
      No change made.
- [x] 6.2 ~~`my-calendars/page.tsx` — wrap with `<RequireAbility subject="Roster">`~~ — superseded:
      same reason as 6.1 (unbuilt scaffold placeholder, `GENERAL_ROUTES`, no established subject).
      No change made.
- [x] 6.3 ~~`my-availabilities/[id]/page.tsx` — wrap with `<RequireAbility subject="availability">`~~
      — superseded: real page, but `GENERAL_ROUTES` (no `requiredPermission` by convention) and
      the only existing `availability` subject is the *manager's* review-all-submissions grant
      (`MANAGER_ROUTES` `/availabilities`), not a staff member's own — reusing it risks locking
      staff out of their own self-service page. No change made.

## 7. Verification

- [x] 7.1 `pnpm lint` — pre-existing failures unrelated to this change (e.g. `no-undef 'React'` in
      `src/components/ui/skeleton.tsx`/`sonner.tsx`/`spinner.tsx`, unused-vars in
      `drawer-form.tsx`/`generic-table.tsx`/`sidebar.tsx`/`page-navigator.tsx`, `any` usage in
      `axios.ts`/`AuthContext.tsx`, etc.) block a clean full-repo run; confirmed none of this
      change's files (new `usePageAbility.ts`/`require-ability.tsx`, edited `middleware.ts`,
      `jwt.ts`, `routes.ts`, and every wrapped page) appear anywhere in the lint output.
- [x] 7.2 `pnpm dev` (port 3016) + `curl` against the running server, automated (no live backend
      available, so login/`/me/abilities` can't be exercised — see caveat below):
      - Middleware, all 5 scenarios confirmed via `curl -D -` with crafted JWTs: no cookie → 307 to
        `/login?returnUrl=...`; expired-payload cookie → 307 to the same, plus
        `Set-Cookie: access_token=; Expires=...1970...` clearing it; unexpired (unsigned) cookie →
        200 through to the page, confirming no signature check per design.md Decision 4; unexpired
        cookie hitting `/login` → 307 to `/`; expired cookie hitting `/login` → 200 (stays on
        login, not bounced elsewhere).
      - Every touched page (`/users`, `/roles`, `/roles/1`, `/permissions`,
        `/permission-simulator`, `/audit-log`, `/branches`, `/employees`, `/shifts`, `/shifts/1`,
        `/rosters`, `/shipLogs`) plus the deliberately-untouched `/schedules`, `/my-calendars`,
        `/attendanceTracking`, `/` returned 200 with a valid session cookie — no server-side
        crashes from any `<RequireAbility>` wrap.
      - **Caveat**: this confirms middleware behavior and that no page 500s, but the client-side
        "forbidden" render path (`<RequireAbility>` when `ability.can()` is false) needs a real
        `/me/abilities` response to observe and wasn't exercised — no backend was available in
        this environment. `pnpm build`'s "Compiled successfully" (TypeScript pass) is the other
        signal of correctness; the component itself is a small, direct reuse of the
        `useAbility()`/`ability.can()` pattern already proven in `branches/page.tsx`.
- [x] 7.3 Confirmed: `(dashboard)/page.tsx` is itself an unbuilt scaffold placeholder with no
      `requiredPermission` in `GENERAL_ROUTES` (same category as Decision 6); returns 200 with a
      valid session in the curl smoke test above. Intentionally left ungated.
