## Context

`Cá nhân` (Profile) is the 4th top-level Staff nav section defined in `CLAUDE.md`, and it is
entirely absent from the codebase today — no route, no `GENERAL_ROUTES` entry, no feature module.
The only related things that exist are:

- `useAuth().user` (`AuthUser`, JWT-derived): `id`, `phone`, `role`, `branches` (numeric IDs only),
  `employeeId`, `mustChangePassword`. No name, email, address, or avatar.
- `useGetEmployee(employeeId)` → `Employee` (`src/features/employee/`), fetched via the real
  `GET /employees/{id}` endpoint: `fullName`, `phoneNumber`, `branchIds`, `email`, `address`,
  `avatar`, `dateOfBirth`, `probationStartDate`, `officialStartDate`, `branches[{id,name,
  abbreviation}]`. No `role` and no `hourlyRate` (rate lives behind a separate, currently unused
  `EMPLOYEES.HOURLY_RATES(id)` endpoint).
- `useUpdateEmployee` (admin-facing `PATCH /employees/{id}`), gated by `updateEmployeeSchema =
  employeeFormSchema.partial()`, which today only whitelists `fullName`, `phoneNumber`,
  `branchIds`. `email`/`address`/`avatar`/`dateOfBirth` exist on the read model but have no
  write path (no form, no schema fields) anywhere in the app yet.
- `src/features/auth/components/ChangePasswordForm.tsx` — a complete, working react-hook-form +
  Zod form wired to `AuthContext.changePassword` (`POST /auth/change-password`). Currently only
  rendered full-screen at the standalone `/change-password` route, reached via the forced
  `mustChangePassword` redirect.
- `src/components/nav-user.tsx` — logout is wired (`useAuth().logout()`); the "Account" dropdown
  item is a dead placeholder with no `onClick`.
- No `/auth/me` or `/employees/me` endpoint exists anywhere. `my-calendars/page.tsx` establishes
  the pattern for "my own data" screens: read `employeeId` off `useAuth().user`, fetch via
  `useGetEmployee(employeeId)`, and render an empty state if `employeeId` is missing (account not
  yet linked to an `Employee` record).

This is a small, mostly-composition feature: the read side needs no new endpoint at all; the only
real gap is a write path for self-editable contact fields.

## Goals / Non-Goals

**Goals:**
- Add `/profile` as a real `GENERAL_ROUTES` entry, visible to every authenticated role, so the
  sidebar/bottom-nav and breadcrumbs pick it up automatically (no bespoke nav code).
- Render a read-only view of the signed-in user's own info: name, phone, role, branch(es).
- Let the user self-edit the fields that are genuinely theirs to change (contact-type fields
  only) — not identity fields (`fullName`), not org-assignment fields (`branchIds`), not
  role/hourly-rate.
- Offer voluntary password change from this screen, reusing `ChangePasswordForm` as-is.
- Offer a logout action on the screen itself (in addition to the existing sidebar dropdown),
  since Staff mostly use this app as a bottom-nav mobile view where the desktop sidebar dropdown
  pattern doesn't apply.
- Handle the "no linked Employee record" case the same way `my-calendars` already does.

**Non-Goals:**
- No new backend endpoint (`/me`, `/employees/me`) — this change keys off `user.employeeId` and
  the existing `GET/PATCH /employees/{id}`, matching the established `my-calendars` pattern.
- No avatar upload UI. `avatar` exists on `Employee` but wiring a file-upload flow is out of scope
  for this pass; ship the field as read-only if populated by the backend by other means (or omit
  it) rather than building upload here.
- No editing of `hourlyRate`, `role`, `branchIds`, `fullName`, or any audit/probation date field —
  those stay admin-only, unchanged by this proposal.
- No new `src/features/profile/` module. The read/write surface is thin enough to live as an
  extension of `src/features/employee/` (one additional schema + one additional mutation hook)
  plus page-local components — a whole new feature module would be an unused abstraction for what
  is functionally one more employee-update variant.

## Decisions

**1. Route path: `/profile` (English segment), not `/ca-nhan`.**
Existing `GENERAL_ROUTES` paths are already an English/camelCase mix (`/my-availabilities`,
`/attendanceTracking`); `name`/`breadcrumb` carry the Vietnamese label ("Cá nhân"). Matching that
convention is lower-risk than introducing the first Vietnamese path segment in the app.
*Alternative considered*: `/ca-nhan` — rejected, would be the only Vietnamese-segment route and
sets an inconsistent precedent.

**2. Register in `GENERAL_ROUTES`, not a new role-specific array.**
Profile is universal (every authenticated user has one), matching the other three
`GENERAL_ROUTES` entries, none of which carry a `requiredPermission`. No CASL check needed on the
page itself.

**3. Data fetching: reuse `useGetEmployee(user.employeeId)` verbatim — no new query hook.**
This is the exact `my-calendars/page.tsx` pattern already in the codebase. It also means the
profile page shares the React Query cache key (`queryKeys.employees.detail(employeeId)`) with any
admin-side view of the same employee, so an admin edit and a self-edit both invalidate correctly
against `queryKeys.employees.all()`.
*Alternative considered*: a dedicated `/me`-style backend endpoint — better long-term ergonomics,
but the proposal explicitly flags this as a backend follow-up, not a blocker; frontend work should
not wait on it.

**4. Self-edit surface: extend `employee` feature with a narrow `selfUpdateEmployeeSchema`
(`phoneNumber`, `email`, `address`) and a `useUpdateMyProfile` hook, instead of loosening
`updateEmployeeSchema` or building a new feature module.**
`updateEmployeeSchema` stays admin-scoped and unchanged (still `fullName`/`phoneNumber`/
`branchIds`, used by the admin employee form). The self-service schema is intentionally a
*different, smaller* whitelist so a staff member's own edit form can never submit `branchIds` or
`fullName` regardless of what the underlying `PATCH /employees/{id}` DTO accepts server-side.
`useUpdateMyProfile` wraps `employeeService.update(employeeId, data)` (the same underlying call as
`useUpdateEmployee`, since there is only one update endpoint) but is typed against the narrower
schema and lives in `src/features/employee/hooks/`, invalidating the same
`queryKeys.employees.detail(employeeId)`/`.all()` keys.
*Alternative considered*: reuse `useUpdateEmployee` directly and just render fewer fields in the
form — rejected, because a runtime-only field restriction (UI hides fields) is weaker than a
type-level one (schema doesn't allow them); a future admin-form change to `updateEmployeeSchema`
should not silently widen what a self-edit form can submit.
*Open item carried from the proposal*: confirm with backend that `PATCH /employees/{id}` actually
persists `email`/`address` when submitted (they exist on the read DTO/entity but no write path has
ever exercised them). Build the frontend against the assumption that it does; this is a quick
backend-side check, not a blocker to starting frontend work on the schema/form/read view.

**5. Password change: embed `ChangePasswordForm` inline in the profile page (a card/section),
not a link out to `/change-password`.**
`/change-password` is a full-screen, sidebar-less layout built for the *forced* first-login case.
The *voluntary* case (this feature) is reached from inside the dashboard shell, so keeping the
user inside that shell (dashboard layout, breadcrumbs, nav all still visible) is better UX than
bouncing them to the standalone forced-flow screen. `ChangePasswordForm` already contains its own
`<Card>` and submit wiring — no changes needed to reuse it, just render it inside a
`profile/change-password-section.tsx` wrapper (or directly) on the page.
*Alternative considered*: link to `/change-password?returnUrl=/profile` — simpler, but leaves the
dashboard shell for a screen designed around the forced-redirect flow (which itself hard-checks
`mustChangePassword`); embedding avoids any interaction between the two flows.

**6. Logout: add an explicit "Đăng xuất" action on the profile page calling `useAuth().logout()`
directly (the same call `nav-user.tsx` already makes) — no shared hook/component extraction.**
It's a single async function call already exposed by `AuthContext`; wrapping it in an
abstraction for two call sites is unnecessary. Also wire `nav-user.tsx`'s dead "Account"
dropdown item to `router.push('/profile')` so desktop users have a second entry point.

**7. Empty state for unlinked accounts: reuse the same copy/pattern as `my-calendars/page.tsx`**
("Chưa liên kết hồ sơ nhân viên") when `user.employeeId` is falsy, rather than inventing new
copy, so the app is consistent about this edge case across self-service screens.

**8. File layout: `src/app/(dashboard)/profile/page.tsx` plus page-local presentational
components in the same folder** (`profile-info-card.tsx`, `profile-edit-form.tsx`,
`change-password-section.tsx`), matching the established pattern where route-specific
presentation lives next to `page.tsx` and only shared data/logic lives in `src/features/`.

## Risks / Trade-offs

- **[Risk — RESOLVED 2026-09-04]** Live-tested against a local backend: a Staff-role account
  calling `PATCH /employees/{id}` on its own record from the self-edit form got 403 Forbidden —
  a full authorization denial, not a field-whitelisting gap. **Fixed on the backend** with a
  dedicated `PATCH /employees/me` endpoint (self-resolved from the JWT, no `:id`, so it can never
  target another employee; `phoneNumber`/`email`/`address` whitelist enforced server-side via the
  existing `forbidNonWhitelisted` `ValidationPipe`, hard 400 on any other field; 403 for accounts
  with no linked Employee). The frontend was rewired accordingly (`employee.service.ts`'s
  `updateMyProfile`, `useUpdateMyProfile`) and the fix was independently re-verified — both via
  direct API calls (valid update, forbidden-field rejection, no-employee 403, and confirming the
  admin `PATCH /employees/:id` route still rejects Staff callers) and via a full browser
  click-through of the real save flow. See tasks.md task 1.1/2.5-2.7 for details.
- **[Risk]** Accounts with no linked `Employee` (`employeeId` undefined) can reach `/profile` and
  see only the empty state, with no way to view even their `phone`/`role` from `AuthUser`. →
  **Mitigation**: still render the `AuthUser`-derived fields (phone, role) above/independent of
  the employee-fetch block, so the empty state only replaces the employee-specific section, not
  the whole page.
- **[Trade-off]** Embedding `ChangePasswordForm` inline duplicates some visual chrome (it renders
  its own `<Card>`) inside a page that likely already uses cards for other sections. Acceptable
  for now; a follow-up could extract a headless version of the form if the double-card look needs
  cleanup.
- **[Trade-off]** `routeHelpers.findRouteByPath` only searches `[...GENERAL_ROUTES,
  ...ADMIN_ROUTES]`, omitting `MANAGER_ROUTES`, from a pre-existing bug unrelated to this change.
  Since the new route is added to `GENERAL_ROUTES`, breadcrumbs work correctly for it regardless —
  noted here only so it isn't mistaken for a regression introduced by this change.

## Migration Plan

No data migration. Rollout is a single frontend deploy:
1. Add the schema/hook additions to `src/features/employee/` (non-breaking, additive).
2. Add the `/profile` route, page, and page-local components.
3. Register `/profile` in `GENERAL_ROUTES`.
4. Wire `nav-user.tsx`'s "Account" item to the new route.

Each step is independently shippable and additive; nothing existing is removed or changed in a
breaking way. Rollback is a plain revert of the same commits.

## Open Questions

- Does `PATCH /employees/{id}` on the backend actually persist `email` and `address`, or are
  those entity fields currently write-inert? (See Risk above — resolve before finalizing the
  self-edit field list.)
- Should `avatar` be shown at all in this pass (read-only, if a backend process ever populates
  it), or omitted entirely until upload is built? Leaning omit — nothing currently sets it.
- Is there a Vietnamese-appropriate icon convention to follow for the sidebar entry beyond "pick
  a reasonable lucide-react user icon" (e.g. `UserRound`)? Low-stakes, default to `UserRound`
  unless the user/designer prefers otherwise.
