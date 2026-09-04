## Why

`CLAUDE.md`'s 4th primary nav section, **Cá nhân (Profile)**, doesn't exist in the codebase at
all: no route under `src/app/(dashboard)/`, no entry in `GENERAL_ROUTES`/`MANAGER_ROUTES` in
`src/constants/routes.ts` (the source the sidebar renders from). Today a user can only log out
(via a dropdown in `nav-user.tsx`) and, if forced, land on the standalone `/change-password`
page outside the dashboard shell — there is no screen to view or update personal information,
and no self-service entry point to change password voluntarily (only the forced-first-login
path exists).

This is one of only 4 top-level sections the spec defines, not a peripheral feature — its total
absence is a bigger gap than any single broken screen elsewhere in the app.

## What Changes

- Add a `/profile` route under `src/app/(dashboard)/` (or `/ca-nhan` if a Vietnamese path is
  preferred — check the existing route-naming convention, which currently mixes English path
  segments with Vietnamese `name`/`breadcrumb` labels, e.g. `/my-availabilities` → "Đăng ký ca").
- Add a `GENERAL_ROUTES` entry in `src/constants/routes.ts` so it appears in the sidebar for
  every role, matching the existing `RouteConfig` shape.
- Build the screen per spec: view personal information (name, phone, branch(es), role — whatever
  the backend's `/employees/:id` or `/me`-equivalent endpoint already returns), an edit form for
  the fields that are actually meant to be self-editable (check with backend which `Employee`/
  `User` fields an employee can update themselves vs. Admin-only — likely just contact-type
  fields, not role/branch/hourly-rate), a link to `/change-password` (voluntary, not just
  forced), and a logout action (can reuse the existing logic from `nav-user.tsx` rather than
  duplicating it).
- Confirm with the backend which endpoint is the right "get my own profile" source — check
  whether `GET /employees/:id` scoped to `$self` already works for this, or whether a dedicated
  `/me`-style endpoint would be cleaner. Flag as a quick backend-side check, not a blocker to
  starting frontend work on the read-only view.

## Capabilities

### New Capabilities
- `staff-profile-view`: a Staff (or any role) can view and update their own personal information,
  reach password change voluntarily, and log out — all from a proper nav section instead of
  workaround paths.

## Impact

`src/app/(dashboard)/profile/page.tsx` (new), `src/constants/routes.ts`, possibly a new
`src/features/profile/` module (or reuse `src/features/employee/` if the self-view maps cleanly
onto the existing employee hooks/services), `src/components/nav-user.tsx` (link to the new page
instead of/alongside direct logout).
