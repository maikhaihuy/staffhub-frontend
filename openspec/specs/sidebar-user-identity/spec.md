# sidebar-user-identity Specification

## Purpose

Ensures the sidebar footer shows the real signed-in user's own identity instead of a hardcoded demo placeholder, using only the fields the auth session actually provides.

## Requirements

### Requirement: Sidebar footer displays the authenticated user's own identity
The sidebar footer (`NavUser`, rendered from `AppSidebar`) SHALL display the currently
authenticated user's own identity, sourced from `AuthContext`'s `user` (`AuthUser`), instead of a
static placeholder object. `AuthUser` exposes `phone` and an optional `role` (there is no `name`,
`email`, or `avatar` field). The primary identity line SHALL show `phone`; when `role` is present
it SHALL be shown as secondary text.

#### Scenario: Logged-in user views the sidebar
- **WHEN** an authenticated user with `phone: "0901234567"` and `role: "manager"` views any
  dashboard page
- **THEN** the sidebar footer shows `0901234567` as the primary line and `manager` as secondary
  text, not a hardcoded demo name/email

#### Scenario: User has no linked employee record
- **WHEN** the authenticated user's `AuthUser.role` is undefined (no employee record linked)
- **THEN** the sidebar footer shows only `phone` as the primary line, with no secondary text and
  no error

### Requirement: Sidebar avatar always renders the fallback
Since no avatar field exists on `AuthUser`, the sidebar footer's avatar SHALL always render its
fallback (initials/icon) rather than attempting to load a hardcoded or missing avatar image URL.

#### Scenario: Avatar display for any authenticated user
- **WHEN** the sidebar footer renders for any authenticated user
- **THEN** it shows the avatar fallback, and does not request `/avatars/shadcn.jpg` or any other
  placeholder image URL
