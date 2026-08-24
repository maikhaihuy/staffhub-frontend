# roster-calendar Specification

## Purpose

Gives admins a read-only weekly calendar view, per branch, of which shift templates ran on which days, who's assigned, and aggregate coverage stats — built entirely by composing master-shift-template, master-shift, sub-shift, and assignment data.

## Requirements

### Requirement: Weekly grid keyed by template row and day column
The roster page SHALL render one row per master shift template (for the selected branch) and one column per day of the displayed week, placing each branch's master shift into the cell where its `masterShiftTemplateId` and date-only `workDate` match the row/column.

#### Scenario: A branch with no shift for a given template/day
- **WHEN** no master shift exists for a template/day combination
- **THEN** that grid cell renders empty rather than erroring

### Requirement: Only the selected branch's data is fetched
The system SHALL scope all master-shift-template, master-shift, and assignment queries to the currently selected branch tab, and SHALL NOT fetch or render data for other branches until they're selected.

#### Scenario: Switching branch tabs
- **WHEN** the admin switches to a different branch tab
- **THEN** the system fetches that branch's templates/shifts/assignments and the previous branch's data is no longer rendered

### Requirement: Summary cards aggregate live data without duplicate fetches
The page SHALL show Total Shifts (count of master shifts in the week), Total Assignments (sum of assignments across all sub-shifts in the week), Total Capacity (sum of `maxAssignments` across all sub-shifts), and Active Employees (distinct `employeeId` count across those assignments) — computed from the same assignment queries each calendar cell already runs, using identical query-cache keys so the aggregate does not issue duplicate network requests.

#### Scenario: Computing Active Employees
- **WHEN** the same employee has assignments in two different sub-shifts within the displayed week
- **THEN** they are counted once in Active Employees, not twice

### Requirement: Assigned employees show attendance status, not custom scheduled times
Each assignment rendered in a calendar cell SHALL show either its actual check-in/check-out times (if recorded) or its current `status` badge. There is no per-assignment custom *scheduled* time distinct from the sub-shift's own `startTime`/`endTime` — "adjusted" only ever refers to actual attendance deviating from the sub-shift's schedule, never a bespoke planned time.

#### Scenario: Assignment with no recorded attendance yet
- **WHEN** an assignment has neither `actualStartTime` nor `actualEndTime`
- **THEN** the cell shows the assignment's status (e.g. "SCHEDULED") instead of a time range

### Requirement: Week navigation controls the displayed week
The page SHALL let the admin move to the previous week, the next week, or jump back to the current week, and SHALL re-fetch master shifts (and dependent assignment queries) for the newly selected week's date range.

#### Scenario: Navigating to next week
- **WHEN** the admin clicks the "next week" control
- **THEN** the grid's day columns advance by seven days and the page fetches master shifts for the new `from`/`to` range

#### Scenario: Returning to the current week
- **WHEN** the admin clicks "this week" after navigating away
- **THEN** the grid returns to the week containing today's date

### Requirement: Empty template/day cells offer a Generate action
For a template/day cell with no matching master shift, the page SHALL offer a "Generate" action that calls `POST /master-shifts/generate` with that cell's `masterShiftTemplateId` and date, and SHALL replace the empty cell with the newly generated shift on success. The action SHALL be disabled per the `master-shift-template` capability's generation-eligibility rule when the template has no sub-shift templates.

#### Scenario: Generating a shift from an empty cell
- **WHEN** the admin clicks "Generate" on an empty cell for a template/day
- **THEN** the system calls generate for that template and date, and the cell then renders the resulting master shift's sub-shifts

#### Scenario: Bulk-generating the displayed week
- **WHEN** the admin clicks a branch-level "Generate this week" action
- **THEN** the system calls generate for every template/day combination in the displayed week that does not yet have a master shift, skipping combinations that already do

### Requirement: Sub-shift rows offer an Assign action
Each rendered sub-shift row SHALL offer an "Assign" action that opens an employee-assignment dialog (employee picker plus optional note), creating an assignment via the existing `assignment` capability's create endpoint and reflecting it in the row on success.

#### Scenario: Assigning an employee to a sub-shift
- **WHEN** the admin uses the Assign action on a sub-shift row and selects an employee
- **THEN** the system creates an assignment for that `subShiftId`/`employeeId` and the row shows the newly assigned employee

### Requirement: Weekly Schedule page links back to Shift Templates
The page header SHALL include a link to the Shift Templates page (`/shifts`), scoped to the currently selected branch, so a manager can jump to adjust a template's structure without losing their place.

#### Scenario: Jumping to Shift Templates from the Weekly Schedule page
- **WHEN** the admin clicks "Manage Shift Templates" on the Weekly Schedule page
- **THEN** the system navigates to `/shifts` with the same branch pre-selected
