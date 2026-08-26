## Context

`useAbility()` (`src/features/auth/hooks/useAbility.ts`) fetches `/me/abilities` once per
session (React Query, keyed by `user.id`) and builds a CASL `MongoAbility` from the resolved
rules. `src/constants/routes.ts` already carries a `requiredPermission: { action, subject }` per
admin/manager nav entry, and `app-sidebar.tsx`'s `filterByAbility` uses it to hide nav links the
current user can't reach. That mapping does not gate the routes themselves — `filterByAbility`
only decides what shows in the sidebar, so entering the URL directly (typed, bookmarked, or
linked from elsewhere) still renders the full page.

Two gaps exist independently:
1. **Page-level UI**: 12+ `(dashboard)` pages render unconditionally for any authenticated user;
   only `branches/page.tsx` calls `ability.can()`, and only to hide one delete button, not to
   gate the page.
2. **`routes.ts` coverage**: it only lists nav-visible list routes. `/schedules` has a page but
   no entry at all (so no nav link and nothing to reuse). Dynamic detail routes (`/roles/[id]`,
   `/shifts/[id]`, `/my-availabilities/[id]`) also aren't listed — `requiredPermission` only ever
   targeted a nav item, not a URL pattern, so it has no way to represent `/roles/[id]` as opposed
   to `/roles`.
3. **`middleware.ts`**: gates purely on cookie presence (`request.cookies.get('access_token')`),
   not on token validity. An expired token still passes the request through to a page whose
   first API call will 401, refresh-loop, or flash content before the client-side redirect fires.

## Goals / Non-Goals

**Goals:**
- Every `(dashboard)` admin/manager-management page that has (or should have) a real, unambiguous
  CASL `action`/`subject` behind it - i.e. everything under `ADMIN_ROUTES`/`MANAGER_ROUTES` in
  `routes.ts`, plus `branches` and `permission-simulator` - checks the current user's ability
  before rendering its real content, with a consistent fallback (not a silent blank page, not a
  full unguarded render). See Decisions 3 and 6 for the two page categories this deliberately
  excludes and why.
- `middleware.ts` rejects requests carrying a structurally invalid or expired token instead of
  letting them reach a page that will fail on its first API call.
- One documented decision on whether route-level *role/permission* gating belongs in middleware
  or stays client-side — not left as an implicit accident of what's convenient to implement.

**Non-Goals:**
- Replacing or duplicating the backend's own authorization checks — the backend remains the
  source of truth; this change is purely about not rendering UI the user can't act on.
- Verifying the JWT signature in middleware. The frontend has no signing secret and shouldn't;
  signature verification already happens on every API call server-side.
- A generic role-based-access-control system. This reuses the CASL ability model that already
  exists (`ability.ts`, `useAbility.ts`) — no new permission model.

## Decisions

### 1. Per-page `<RequireAbility>` wrapper, not a central layout-level gate

Considered gating centrally in `(dashboard)/layout.tsx` by matching `usePathname()` against a
flattened `routes.ts` table (single change, zero per-page edits). Rejected: `routes.ts` only
describes nav-visible *list* routes today, not dynamic detail segments, and not `/schedules`
(missing entirely — see Context #2). A pathname-matching table would need prefix/pattern matching
for `/roles/[id]` vs `/roles`, `/shifts/[id]` vs `/shifts`, etc., which reintroduces the exact
kind of route-to-permission drift this change is trying to remove, and it puts a page's own
authorization requirement in a file the page doesn't own.

Instead: a small `usePageAbility(action, subject)` hook (`src/lib/hooks/usePageAbility.ts`) plus a
`<RequireAbility action subject>` component (`src/components/require-ability.tsx`) built on top
of it. Each page wraps its content:

```tsx
export default function UsersPage() {
  return (
    <RequireAbility action="read" subject="users">
      {/* existing page content, unchanged */}
    </RequireAbility>
  );
}
```

This mirrors the existing per-page pattern already seen in `branches/page.tsx` (`ability.can()`
called inline) rather than inventing a second, centrally-owned mechanism. It also means dynamic
detail pages (`roles/[id]/page.tsx`) declare their own `action`/`subject` directly — no need to
extend `RouteConfig` to express URL patterns it was never designed for.

`routes.ts`'s `requiredPermission` and the new per-page `<RequireAbility>` call are **not**
unified into one source of truth in this change — they answer different questions (nav
visibility vs. render gating) and can already drift only in the "sidebar shows a link the page
then blocks" direction, which is safe (dead link risk, not an exposure risk). Unifying them is
tracked as an Open Question below, not blocking this change.

### 2. `<RequireAbility>` fallback: not-found-style message, not silent redirect

On a failed check, `<RequireAbility>` renders an inline "Bạn không có quyền truy cập trang này"
state in place of the page content (same slot, sidebar/layout still present) rather than
redirecting to `/` or `/login`. Rationale: the user *is* authenticated — this is an authorization
failure, not an authentication one, and redirecting them away can loop (if `/` also requires an
ability they lack, or bounce them somewhere confusing) and hides *why* nothing loaded. While
`useAbility()` is still loading, it renders the same loading state `AuthGuard` uses today, so
page bodies don't flash forbidden-then-allowed.

### 3. `/schedules` is a deprecated redirect stub, not a page to gate

Correction made during implementation: `/schedules/page.tsx` is not a feature page with its own
content. Per the archived change `shift-template-weekly-schedule-ia`, `/schedules` ("Xếp ca") was
deliberately retired and dropped from `MANAGER_ROUTES` in favor of the interactive Weekly
Schedule at `/rosters`; the route file was deliberately kept only as a client-side
`router.replace("/rosters")` redirect "for one release instead of a hard 404" (see its own code
comment), not reinstated as a real screen.

The original plan here (backfill `/schedules` into `routes.ts` with a new `{ action: 'read',
subject: 'Schedule' }`) would have silently undone that prior decision — re-adding nav visibility
for a retired page — and invented a permission subject with no backend grant behind it. Worse, it
would not actually have protected anything: the redirect fires unconditionally from a `useEffect`
in the component body, not from anything `<RequireAbility>` could gate, so wrapping it would only
have risked showing a "no access" message to users who already have every reason to land on
`/rosters` (which is independently gated on `Roster`, per Decision 1 above).

**Revised decision**: leave `/schedules/page.tsx` un-gated and `routes.ts` untouched for this
route. It has no content of its own to protect, and its target (`/rosters`) already enforces the
real check. `routes.ts`'s `/schedules` entry is deliberately absent, not a gap.

### 4. `middleware.ts`: decode-and-check-expiry only, no signature verification

Add a small edge-safe helper (`src/lib/utils/jwt.ts`) that base64url-decodes the JWT payload
segment (no new dependency — `atob` is available in the Edge runtime) and checks `exp` against
the current time. Treat *any* decode failure (malformed token, missing `exp`) the same as an
expired token. On failure, delete the `access_token` cookie and redirect to `/login` with the
same `returnUrl` handling already used for the missing-cookie case, instead of leaving a dead
cookie that keeps failing the same way on every request.

Signature verification is explicitly out of scope (Non-Goals) — middleware has no way to verify
without embedding a secret in the frontend, and the backend already rejects tampered tokens on
every real API call. This check exists purely to avoid rendering a dashboard page that is
guaranteed to immediately fail its first request, not to establish trust.

### 5. Role/ability-level gating stays client-side; middleware does authentication only

This is the design choice the proposal flagged as needing a documented decision.

**Decision: middleware checks authentication (token present + not expired) only. It does not
check CASL abilities or gate routes by role/permission.**

Why: the resolved ability rules (`AbilityRule[]` from `/me/abilities`) are not embedded in the
JWT — they're a separate, backend-resolved list that can include per-record conditions (e.g.
`$self`-scoped rules resolved server-side, per `ability.ts`'s doc comment). Middleware would have
to make its own network call to `/me/abilities` on every navigation to replicate that check,
which:
- adds a request (and its latency) to every dashboard navigation, including ones the client-side
  check would otherwise skip via the already-cached React Query result;
- creates a second place where ability rules must be fetched and interpreted, which can drift
  from the client-side CASL instance (e.g. if the two ever cache/refresh on different schedules);
- still wouldn't remove the need for the client-side check, since abilities can change during a
  session (role edited by an admin) without the JWT itself expiring — the page still needs to
  react to that, so the middleware check would be pure overhead, not a replacement.

The client already does this cheaply: `useAbility()` fetches once per session and every page's
`<RequireAbility>` reads the already-hydrated CASL instance with no extra network cost.

### 6. General self-service pages are excluded from this change

Correction made during implementation, same category of issue as Decision 3: `attendanceTracking`,
`my-calendars`, and `my-availabilities/[id]` all sit in `routes.ts`'s `GENERAL_ROUTES`, which
carries no `requiredPermission` for any entry - by the file's own doc comment, "a route with no
`requiredPermission` is always shown." That is a deliberate existing convention: these are
core self-service screens every authenticated employee gets, not admin-granted capabilities.

Two further problems surfaced on inspection:
- `attendanceTracking` and `my-calendars` are unmodified Next.js scaffold placeholders (static
  `bg-muted/50` blocks, no data, no logic). An already-drafted, not-yet-started change
  (`flesh-out-placeholder-dashboard-pages`) explicitly defers deciding their permission model:
  "each page needs its own scoping pass before this becomes a real requirement." Assigning them
  an ability subject now would preempt that undone scoping work with a guess.
- `my-availabilities/[id]` is a real, built page, but the only existing related `requiredPermission`
  is `MANAGER_ROUTES`' `/availabilities` (`{ action: 'read', subject: 'availability' }`) - the
  *manager's* view of all submitted availability, a genuinely admin-gated capability. Reusing that
  same subject for the *staff* self-service page would conflate two different scopes ("manage
  everyone's availability" vs. "view my own"); without confirming the backend actually grants
  every Staff-role user a self-scoped `read:availability` rule, wrapping this page risks the same
  failure mode as Decision 3 - locking legitimate users out of a page they currently reach fine.

**Revised decision**: none of these three pages are wrapped with `<RequireAbility>` in this
change. This narrows the proposal's original page list (see proposal.md "What Changes") to the
pages that already have an established, unambiguous `action`/`subject` convention behind them -
i.e. the `ADMIN_ROUTES`/`MANAGER_ROUTES` pages already carrying a `requiredPermission` in
`routes.ts` prior to this change, plus `branches` and `permission-simulator` (already partially
ability-aware). General self-service pages remain a follow-up once their own scoping work lands.

## Risks / Trade-offs

- **[Risk]** Per-page `<RequireAbility>` requires touching every listed page file individually,
  so a future new page can be added without a guard and silently render unconditionally →
  **Mitigation**: not solved by this change (see Open Questions — a lint rule or route-manifest
  test is future work); for now, `tasks.md` enumerates every current page explicitly.
- **[Risk]** Decoding the JWT payload in middleware without verifying its signature means a
  crafted-but-unexpired token still passes the middleware check → **Mitigation**: this was already
  true before this change (middleware only checked cookie presence) and is unchanged in severity —
  the backend independently verifies the signature on every real API call, which is the actual
  trust boundary. This change only makes the *expired* case fail fast.
- **[Risk]** `<RequireAbility>`'s forbidden fallback still mounts the sidebar/layout, which itself
  already ability-filters nav links — a user landing on a forbidden page via direct URL sees a
  "no access" page framed by nav links they *do* have access to, which is intended (not a leak),
  but should be verified visually so it doesn't look broken.

## Migration Plan

No data migration. Rollout is additive UI gating:
1. Add `usePageAbility` + `<RequireAbility>` (no consumers yet — no behavior change).
2. Add the `middleware.ts` expiry check behind the same redirect path already used today (no new
   redirect target — no behavior change for valid sessions).
3. Wrap each listed page one at a time; each wrap is independently revertable (remove the
   wrapper) without touching the shared hook/component or middleware.

Rollback: revert the per-page wrapper commits individually if a specific page's `action`/
`subject` turns out wrong for its current rollout of permission data; the shared hook, component,
and middleware change are low-risk enough to roll back only if the expiry check itself is found
to misfire (e.g. clock-skew false positives).

## Open Questions

- Should `routes.ts`'s `requiredPermission` and each page's `<RequireAbility>` call eventually be
  unified into one declaration (e.g. page reads its own required permission from `routes.ts`
  instead of repeating it), once `routes.ts` is extended to cover dynamic and currently-unlisted
  routes? Deferred — out of scope here, worth revisiting if the two drift in practice.
- Is there an appetite for a lint rule or a route-manifest test that fails CI when a new
  `(dashboard)/**/page.tsx` is added without a `<RequireAbility>` (or an explicit opt-out)? Not
  attempted in this change; flagged as follow-up.
