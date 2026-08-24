## Why

The current Weekly Schedule page (`/rosters`) renders a template-row x day-column grid: each cell is a small colored box cramming every sub-shift row, assign icon, and assignment chip into a tight space, and the "Generate" action is a bare `+` icon with no label. For a branch manager scanning "what does Monday look like and who's missing," a dense 8-column grid reads like a spreadsheet, not a schedule. It doesn't match how a manager actually thinks about their week: one day at a time, each operational shift as a clear block, each sub-shift's assignment status obvious at a glance. We're redesigning the same screen's layout and interactions - day-grouped sections instead of a grid, inline employee-assignment selects instead of icon-triggered dialogs, and a visually unmistakable unassigned state - while keeping it a deliberately simple MVP (no drag-and-drop, no Google-Calendar-style time-axis view).

## What Changes

- Replace the template-row/day-column grid on `/rosters` with a day-grouped layout: one section per day of the week, each section listing that day's generated master shifts as cards, each card listing its sub-shifts as rows.
- Replace the per-sub-shift "assign icon → dialog → select → confirm" flow with an inline employee-select dropdown directly on the sub-shift row (click the row's select → pick employee → confirm), removing the separate `AssignEmployeeDialog` modal for the common case.
- Make an unassigned sub-shift visually distinct (badge/border/color) instead of just showing "0 assignments" text, so gaps are scannable across a day at a glance.
- Add a lightweight per-sub-shift warning state for capacity conflicts (assignments exceeding `maxAssignments`) or a stale/unavailable employee note, without introducing full scheduling-conflict detection.
- Keep existing week navigation (previous/this-week/next), branch tabs, and the "Generate" action per master-shift/day, but restyle Generate as a clearly-labeled affordance on an empty day slot rather than an icon-only button.
- Define responsive/mobile behavior for the day-grouped layout (days stack vertically already; specify what collapses on narrow viewports).
- Drop the export-to-Excel/PDF buttons and the aggregate summary-cards row from scope of this redesign (out of scope, not removed - they're unrelated to the day-grouped layout question and can stay or move later); note this explicitly so implementation doesn't silently drop working buttons without a decision.

## Capabilities

### New Capabilities

(none - this reshapes an existing capability's UI, it doesn't introduce new backend-facing behavior)

### Modified Capabilities

- `roster-calendar`: replace the "weekly grid keyed by template row and day column" requirement with a day-grouped requirement (day sections containing master-shift cards containing sub-shift rows); replace the icon-dialog assignment requirement with an inline-select assignment requirement; add requirements for the unassigned visual state and the capacity-conflict warning state; keep branch scoping, week navigation, and the generate-eligibility rule as-is.

## Impact

- `src/app/(dashboard)/rosters/`: `branch-calendar-table.tsx` (grid rendering, legend, summary cards, export buttons) is restructured into a day-grouped equivalent; `calendar-slot-cell.tsx` and `assign-employee-dialog.tsx` are replaced by an inline sub-shift-row assignment component; `generate-cell.tsx` is restyled, not replaced.
- No API or schema changes - this only reshapes how existing `master-shift-template`, `master-shift`, `sub-shift`, and `assignment` data already fetched by the page is laid out and interacted with.
- `openspec/specs/roster-calendar/spec.md` requirements change; no other main spec is touched.
