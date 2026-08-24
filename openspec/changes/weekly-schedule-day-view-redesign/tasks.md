## 1. Layout shell and week navigation

- [x] 1.1 Extract the previous/this-week/next week-navigation controls out of `branch-calendar-table.tsx` into a standalone `WeekNavigator` component, preserving existing behavior and query re-fetch on week change.
- [x] 1.2 Build `DayJumpStrip`: seven day-abbreviation chips for the displayed week that scroll the page to the matching `DaySchedule` section on click (via anchor id or `scrollIntoView`), without changing the displayed week or triggering a re-fetch.
- [x] 1.3 Create `WeeklyScheduleView` as the new top-level component rendered by `rosters/page.tsx` in place of `BranchCalendarTable`, composing `WeekNavigator`, `DayJumpStrip`, and a vertical stack of seven `DaySchedule` sections (Mon-Sun) for the selected branch and week.
- [x] 1.4 Keep `rosters/page.tsx`'s branch tabs and header ("Manage Shift Templates" link) unchanged, only swapping the child component.

## 2. Day sections and shift cards

- [x] 2.1 Build `DaySchedule`: given a branch, a date, and the week's fetched master shifts, render that day's header (day name + date) and its `MasterShift`s as `MasterShiftCard`s ordered by `startTime`.
- [x] 2.2 Build `MasterShiftCard`: header row (template name, time range, per-template accent color per existing `colorForTemplate` logic) plus a body listing `SubShiftRow`s ordered MAIN-then-SUPPORT by `startTime`; render the muted "No sub-shifts configured for this template" line when a master shift has zero sub-shifts.
- [x] 2.3 Build `EmptyDayCard`: rendered when a day has zero generated master shifts, showing a muted message and a labeled Generate affordance (see 5.1) for each eligible template.
- [x] 2.4 Wire `DaySchedule` to render `EmptyDayCard` when the day has no master shifts, otherwise the `MasterShiftCard` stack.

## 3. Sub-shift rows and inline assignment

- [x] 3.1 Build `SubShiftRow`: label + time range, capacity badge (`count/max`, only when `maxAssignments` is set), and the assignment area, reusing the existing `useGetAssignmentsBySubShift` / `useGetEmployees` / branch-eligibility filtering logic currently in `calendar-slot-cell.tsx`.
- [x] 3.2 Build `AssignmentControl`: an inline `Select` that shows "Unassigned" as placeholder or the current assignee's name as value, with a staged-selection state (pick → confirm/cancel buttons appear → confirm calls `useCreateAssignment`, cancel reverts to the prior displayed state without mutating).
- [x] 3.3 Extend `AssignmentControl`'s host row to support `maxAssignments > 1`: render existing assignees as chips (reuse current chip markup/attendance-status logic from `calendar-slot-cell.tsx`) plus an "Add" trigger that opens the same select-then-confirm flow, hidden once `assignments.length === maxAssignments`.
- [x] 3.4 Preserve the existing attendance rendering (actual check-in/out times, "adjusted" highlight, status badge) unchanged inside each assignee chip.

## 4. Unassigned and warning states

- [x] 4.1 Apply the warning color treatment (border/background tint) to `SubShiftRow` when it has zero assignments, alongside the "Unassigned" label already produced by `AssignmentControl`.
- [x] 4.2 Add an "Over capacity" badge on `SubShiftRow` when `assignments.length > maxAssignments`.
- [x] 4.3 Add an inline "no longer in this branch" note on an assignee chip when that employee is absent from the row's current `availableEmployees`/branch set.

## 5. Generate action

- [x] 5.1 Restyle the Generate affordance as a labeled button/text link (not an icon-only control), reusing `generate-cell.tsx`'s `useSubShiftTemplateComposition` eligibility check and `useGenerateMasterShift` mutation, placed inside `EmptyDayCard` per eligible template.
- [x] 5.2 Keep the branch-level "Generate this week" bulk action, relocated to sit above the day sections (e.g. next to `WeekNavigator`), with unchanged skip-if-exists logic.

## 6. Responsive behavior

- [x] 6.1 Verify `MasterShiftCard` and `SubShiftRow` go full-width and wrap (label/time on one line, assignment control/chips on a second line) below ~400px, instead of truncating.
- [x] 6.2 Make `DayJumpStrip` horizontally scrollable on narrow viewports instead of wrapping.
- [x] 6.3 Confirm branch tabs and `WeekNavigator` retain their existing `flex-wrap` behavior in the new layout.

## 7. Cleanup and verification

- [x] 7.1 Remove `branch-calendar-table.tsx`, `calendar-slot-cell.tsx`, and `assign-employee-dialog.tsx` once their logic has been absorbed into the components above; keep `generate-cell.tsx`'s hooks/mutation usage, updating only its visual shell.
- [x] 7.2 Resolve the design's open question on the summary cards and export buttons (keep above day sections, move elsewhere, or drop) before or during this pass, and implement the decision rather than leaving dead code.
- [x] 7.3 Manually verify in the browser: week navigation, day-jump, generating an empty day, assigning/reassigning single- and multi-capacity sub-shifts, the unassigned visual state, the over-capacity and ineligible-employee warnings, and responsive behavior at a narrow viewport width.
- [x] 7.4 Run `pnpm lint` and fix any resulting issues.
