## 1. Staff schedule view (`/my-calendars`)

- [x] 1.1 Add `useGetEmployee`-free path to get the current employee: read `employeeId` from
      `useAuth().user` in `my-calendars/page.tsx`, and render the "no linked employee" empty state
      when it's missing.
- [x] 1.2 Fetch the employee's assignments via `useGetAssignmentsByEmployee(employeeId)` and the
      employee's branches (reuse `useGetEmployee(employeeId)` for branch names, as
      `my-availabilities/[id]/page.tsx` does).
- [x] 1.3 Build a `weekAnchor` state + `generateWeekdays`/`toDateOnlyString` filtering (mirroring
      `rosters/page.tsx`'s pattern) to derive the displayed week's days and this week's assignments
      from the full `myAssignments` list.
- [x] 1.4 Add previous/next/this-week navigation, reusing `WeekNavigator` from
      `app/(dashboard)/rosters/week-navigator.tsx` if its props fit, otherwise a page-local
      equivalent.
- [x] 1.5 Build a small page-local weekly grid component (day columns, today highlighted, each
      day's assignment(s) shown as a shift block: branch name, sub-shift title, scheduled time
      range) — do not reuse `WeeklyScheduleView`/`ScheduleTable` per design.md.
- [x] 1.6 Add the "no shifts this week" empty state for days/weeks with zero assignments.
- [x] 1.7 Replace the placeholder markup in `src/app/(dashboard)/my-calendars/page.tsx` with the
      above.

## 2. Staff attendance tracking (`/attendanceTracking`)

- [x] 2.1 Read `employeeId` from `useAuth().user` in `attendanceTracking/page.tsx`; render the
      "no linked employee" empty state when missing (same as 1.1).
- [x] 2.2 Fetch the employee's assignments via `useGetAssignmentsByEmployee(employeeId)` and filter
      to today's date (`toDateOnlyString`) to get today's assignment(s).
- [x] 2.3 Render the "no shift today" state when there are zero assignments for today.
- [x] 2.4 For each of today's assignment(s), derive status from `actualStartTime`/`actualEndTime`
      (not checked in / checked in / checked out) and render its scheduled time range, branch, and
      sub-shift title.
- [x] 2.5 Wire the check-in action to `useCheckInAssignment()` (from
      `src/features/assignment/hooks/useAssignmentMutations.ts`), disabled while pending, shown
      only when not yet checked in.
- [x] 2.6 Wire the check-out action to `useCheckOutAssignment()`, disabled while pending, shown only
      when checked in but not checked out.
- [x] 2.7 Show a retry-able error message on check-in/check-out mutation failure (the shared
      `useAppMutation` error toast covers this — verify it fires and the assignment's displayed
      status stays unchanged on failure).
- [x] 2.8 List the shift's task templates read-only: fetch task templates for the assignment's
      branch/master-shift-template via the existing `taskTemplate` hooks, render titles only (no
      checkbox, no completion state, no evidence upload).
- [x] 2.9 Replace the placeholder markup in `src/app/(dashboard)/attendanceTracking/page.tsx` with
      the above.

## 3. Verification

- [x] 3.1 Run `pnpm lint`.
- [x] 3.2 Run `pnpm dev` and manually verify, as a Staff-role account with a linked employee: the
      `/my-calendars` week view (including week navigation and today highlighting), and the
      `/attendanceTracking` check-in → check-out flow (including the case of no shift today).
- [x] 3.3 Manually verify both pages' empty/no-linked-employee states with an account that has no
      `employeeId`.
