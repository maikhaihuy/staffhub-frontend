# roster-calendar Specification

## Purpose

Gives managers an interactive weekly schedule view, per branch, of which shift templates run on which days: generating shifts from templates, assigning employees inline, and surfacing aggregate coverage stats and gaps — built entirely by composing master-shift-template, master-shift, sub-shift, and assignment data.

## Requirements

### Requirement: Weekly view groups shifts by day, not by a template/day grid
The roster page SHALL render one section per day of the displayed week (Monday through Sunday), each section listing that day's generated `MasterShift`s as cards ordered by `startTime`, and each card listing its `SubShift`s ordered MAIN slots first by `startTime` then SUPPORT slots by `startTime`. The page SHALL NOT render shifts as a template-row/day-column grid.

#### Scenario: A day with generated shifts
- **WHEN** Monday has two generated master shifts, "Morning Operation" (08:00-16:00) and "Evening Operation" (16:00-22:00)
- **THEN** the Monday section renders two cards in that start-time order, each showing its own sub-shift rows

#### Scenario: A branch with no shift for a given template/day
- **WHEN** no master shift exists for a template/day combination
- **THEN** that day's section renders no card for that template, rather than an empty grid cell

#### Scenario: A master shift with zero sub-shifts
- **WHEN** a generated master shift has zero sub-shift templates configured
- **THEN** its card shows a muted "No sub-shifts configured for this template" line instead of an empty body

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

### Requirement: Empty days and generate-eligible day/template combinations offer a labeled Generate action
For a day with no generated master shifts at all, the page SHALL show that day's section with a labeled "Generate" affordance (not an icon-only control) covering every branch template eligible per the `master-shift-template` capability's generation-eligibility rule, calling `POST /master-shifts/generate` with the chosen template's id and that day's date, and SHALL replace the empty-day state with the newly generated shift's card on success.

#### Scenario: Generating the first shift for an empty day
- **WHEN** the manager uses the Generate affordance on a day section with no shifts yet, for a template that has at least one sub-shift template
- **THEN** the system calls generate for that template and date, and the day section then shows the resulting master shift's card

#### Scenario: Bulk-generating the displayed week
- **WHEN** the manager clicks a branch-level "Generate this week" action
- **THEN** the system calls generate for every template/day combination in the displayed week that does not yet have a master shift, skipping combinations that already do

#### Scenario: Generate disabled for an ineligible template
- **WHEN** a template has zero sub-shift templates
- **THEN** the Generate affordance for that template/day is disabled, with a hint that the template needs at least one sub-shift template first

### Requirement: Sub-shift rows offer an inline click-select-confirm assignment control
Each sub-shift row SHALL offer an inline employee-select control directly on the row (no separate dialog) for the common case of assigning or reassigning a single slot: selecting an employee from the control SHALL stage the choice and require a separate confirm action before the assignment is created via the existing `assignment` capability's create endpoint. For a sub-shift whose `maxAssignments` is greater than 1, the row SHALL additionally show existing assignees as chips alongside an "Add" trigger that opens the same select-then-confirm control for adding another assignee while `assignments.length < maxAssignments`.

#### Scenario: Assigning an employee to an unassigned single-capacity sub-shift
- **WHEN** the manager selects an employee in an unassigned sub-shift row's control and confirms
- **THEN** the system creates an assignment for that `subShiftId`/`employeeId` and the row's control now shows that employee as the assigned value

#### Scenario: Selecting without confirming does not assign
- **WHEN** the manager picks an employee in the control but has not yet clicked confirm
- **THEN** no assignment is created and the manager can still cancel the selection

#### Scenario: Adding an additional assignee to a multi-capacity sub-shift
- **WHEN** a sub-shift has `maxAssignments` of 2 and one existing assignee, and the manager uses the "Add" trigger to select and confirm a second employee
- **THEN** the system creates a second assignment for that sub-shift and both assignees appear as chips

#### Scenario: Add trigger is unavailable at capacity
- **WHEN** a sub-shift's `assignments.length` equals its `maxAssignments`
- **THEN** the row does not offer an "Add" trigger

### Requirement: Weekly Schedule page links back to Shift Templates
The page header SHALL include a link to the Shift Templates page (`/shifts`), scoped to the currently selected branch, so a manager can jump to adjust a template's structure without losing their place.

#### Scenario: Jumping to Shift Templates from the Weekly Schedule page
- **WHEN** the admin clicks "Manage Shift Templates" on the Weekly Schedule page
- **THEN** the system navigates to `/shifts` with the same branch pre-selected

### Requirement: Unassigned sub-shifts are visually distinct
An unassigned sub-shift row SHALL be rendered with a warning color treatment (e.g. amber border or background tint) in addition to a literal "Unassigned" label on its assignment control, so gaps are scannable by color across a day without relying on color alone.

#### Scenario: Scanning a day for gaps
- **WHEN** a day section has three sub-shift rows, one of them unassigned
- **THEN** the unassigned row is visually distinguishable by both its warning color and its "Unassigned" label, independent of the other two rows

### Requirement: Over-capacity and ineligible-employee assignments show a warning indicator
A sub-shift row SHALL show an "Over capacity" badge when its `assignments.length` exceeds its `maxAssignments`, and SHALL show an inline note next to an assignee's chip when that employee is no longer in the branch's eligible-employee set. Neither condition SHALL block rendering the existing assignment or require any action from the manager.

#### Scenario: Capacity lowered below existing assignment count
- **WHEN** a sub-shift has 2 existing assignments and its `maxAssignments` is edited down to 1
- **THEN** the row shows an "Over capacity" badge alongside both existing assignee chips

#### Scenario: Assigned employee no longer eligible for the branch
- **WHEN** an employee with an existing assignment on a sub-shift is no longer in that branch's eligible-employee set
- **THEN** that employee's chip shows an inline "no longer in this branch" note, and the assignment itself remains visible

### Requirement: Day-jump navigation within a displayed week
The page SHALL show a row of seven day chips (one per weekday of the displayed week) that, when clicked, scrolls the page to that day's section without changing the displayed week.

#### Scenario: Jumping to a specific day
- **WHEN** the manager clicks the "Thu" chip while viewing the current week
- **THEN** the page scrolls to Thursday's day section without re-fetching or changing the displayed week range
