## Purpose

Gives admins a read-only weekly calendar view, per branch, of which shift templates ran on which days, who's assigned, and aggregate coverage stats — built entirely by composing master-shift-template, master-shift, sub-shift, and assignment data.

## ADDED Requirements

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
