## Context

Both pages are self-service, single-employee views for the logged-in user (`AuthUser.employeeId`
from the decoded JWT — see `src/features/auth/types/auth.type.ts`). The data they need already
exists in `src/features/assignment` (`useGetAssignmentsByEmployee`, `useCheckInAssignment`,
`useCheckOutAssignment`), which is exercised today only by `/my-availabilities/[id]` (viewing a
specific employee by id, used there for registering availability) and by the admin `/rosters` view
(`weekly-schedule-view.tsx`, which is shift/branch-centric and includes shift-generation actions
that don't belong on a self-service page). Neither existing component fits `/my-calendars` or
`/attendanceTracking` directly - see proposal.md for why.

## Goals / Non-Goals

**Goals:**
- Reuse existing hooks/services (`assignment`, `employee`) and shared date helpers
  (`generateWeekdays`, `toDateOnlyString` in `src/lib/utils/dateTimeHelpers.ts`) as-is; no new API
  endpoints or DTO shapes.
- Keep both pages simple, employee-scoped read (+ check-in/out) views - no admin controls.

**Non-Goals:**
- No new backend endpoints, and no client-side invention of task-completion/evidence persistence
  (see proposal.md - task-gating is deferred).
- No refactor of `/rosters` or `/my-availabilities` to share components with these two pages -
  their data shape (per-branch, per-template matrix) and audience (admin/self-registration) are
  different enough that forcing a shared component would add indirection without a second concrete
  use case.

## Decisions

**New small feature-local components instead of reusing `WeeklyScheduleView`/`ScheduleTable`.**
Both existing components key off `MasterShiftTemplate`/`SubShift` (a branch's shift catalog) to
build a matrix, because their consumers (`/rosters`, `/my-availabilities/[id]`) are about shift
*capacity and registration*. `/my-calendars` and `/attendanceTracking` only need to render the
employee's own `Assignment[]` (already returned by `useGetAssignmentsByEmployee`, which embeds
`subShift`/`masterShift` summaries per `assignment/spec.md`) grouped by day. Building a
template-matrix for a single employee's assignments would be more code than a direct
`assignments.filter(...)` grouped by date. Alternative considered: extend `WeeklyScheduleView` with
a "read-only self mode" - rejected, since most of its logic (generation, capacity stats,
multi-employee cells) is irrelevant here and would need to be conditionally hidden.

**Filter "today" and "this week" client-side from `useGetAssignmentsByEmployee(employeeId)`.**
There's no `listByEmployee(employeeId, { from, to })` filtered variant on the backend/service today
(`assignment.service.ts` only takes `employeeId`). Given a single employee's assignment volume is
small, fetching all of an employee's assignments and filtering by `toDateOnlyString` client-side
(matching the pattern already used for week generation in `weekly-schedule-view.tsx`) is simpler
than adding a new service/endpoint parameter for this change. If assignment history grows large
enough to matter, adding server-side date filtering is a follow-up, not a blocker here.

**`/attendanceTracking` derives "today's assignment(s)" the same way, and computes status from
`actualStartTime`/`actualEndTime` directly** (no separate status field to sync) - matches how
`assignment/spec.md`'s "Assignment not yet checked in" scenario already treats these fields as the
source of truth.

**Neither page adds a `RequireAbility` gate.** Both are `GENERAL_ROUTES` in `routes.ts` with no
`requiredPermission`, matching `/my-availabilities/[id]`'s existing pattern (any authenticated
employee can see their own schedule/attendance; `middleware.ts` already gates unauthenticated
access).

## Risks / Trade-offs

- **[Risk]** Fetching all of an employee's assignments (unbounded) instead of a date-filtered query
  could get slow for long-tenured employees. → **Mitigation**: acceptable for this iteration given
  current data volume (small shop, weekly rosters); revisit with server-side filtering if it
  becomes a real page-load issue.
- **[Risk]** Showing mandatory task templates read-only (no completion tracking) may read as
  incomplete against CLAUDE.md's full "Nhiệm vụ" spec. → **Mitigation**: proposal.md and both spec
  deltas call this out explicitly as deferred, not forgotten, pending a backend task-completion
  model.
- **[Trade-off]** Two new small, page-local components (not a shared design-system abstraction like
  CLAUDE.md's `ShiftBlock`) means some visual duplication with `/rosters`' day/shift rendering. →
  Accepted for now since there's only this one additional concrete use case; revisit if a third
  weekly-shift view is added.
