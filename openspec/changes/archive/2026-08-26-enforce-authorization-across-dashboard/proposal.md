_Priority: high_

## Why
CASL is fully wired on the frontend (`useAbility()` fetches `/me/abilities`, keyed by user id
so switching accounts can't leak the previous user's permissions) but only 2–3 of roughly 15
dashboard pages — `branches`, `permission-simulator` — actually call `ability.can()` before
rendering. Pages that manage roles, permissions, and users themselves currently render their
full UI for any authenticated session and rely entirely on the backend rejecting unauthorized
API calls. Separately, `src/middleware.ts` only checks whether an `access_token` cookie is
*present* — not whether it's valid or which role it belongs to — so route entry is gated on
"logged in," not "authorized for this route."

## What Changes
- Add a consistent page-level guard (e.g. a `usePageAbility(subject, action)` hook or a
  `<RequireAbility>` wrapper) and apply it to every `(dashboard)` page that currently renders
  unconditionally: `users`, `roles`, `permissions`, `employees`, `rosters`,
  `shifts`, `audit-log`, `shipLogs`.
  (Originally also listed `schedules`, `attendanceTracking`, `my-availabilities`, and
  `my-calendars` — implementation found these are either a deliberately-retired redirect stub or
  general self-service pages with no established permission subject to check; see design.md
  Decisions 3 and 6 for why they're excluded from this change.)
- Extend `src/middleware.ts` to decode and validate the JWT (expiry at minimum) instead of just
  checking cookie presence, redirecting to login on an invalid/expired token rather than letting
  the request through to a page whose API calls will then fail.
- Decide and document whether middleware should also carry role-level route gating, or whether
  that stays purely client-side via the CASL hook — a real design choice worth a short
  `design.md`, not just an implementation detail.

## Capabilities
**New:** `page-level-authorization` — every dashboard route consistently gates its rendered UI
on the current user's CASL abilities, not just on authentication.
**Modified:** (none)

## Impact
`src/middleware.ts`, `src/components/auth-guard.tsx`, every page under
`src/app/(dashboard)/*`, `src/lib/casl/ability.ts`, `src/features/auth/hooks/useAbility.ts`.
