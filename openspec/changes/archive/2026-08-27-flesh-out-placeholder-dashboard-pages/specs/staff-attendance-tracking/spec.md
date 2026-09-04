## Purpose

Lets a logged-in Staff member see today's shift status and check in/out for it directly from the web dashboard, answering the "Am I working today? Can I check in? Can I check out?" questions from a desktop/tablet browser.

## ADDED Requirements

### Requirement: Staff can see today's shift status
The `/attendanceTracking` page SHALL show, for the logged-in user's own employee record, whether they have a shift today and its status: no shift today, upcoming (not yet started), in progress, or ended. This SHALL be derived from `listByEmployee` assignments filtered to today's date plus each assignment's `actualStartTime`/`actualEndTime`.

#### Scenario: Employee has a shift today, not yet checked in
- **WHEN** the employee has an assignment scheduled for today and `actualStartTime` is not set
- **THEN** the page shows the shift's scheduled time range and an "upcoming/not checked in" status

#### Scenario: Employee has no shift today
- **WHEN** the employee has no assignment for today's date
- **THEN** the page shows an explicit "no shift today" state and no check-in/check-out action is offered

### Requirement: Check-in action
When the employee has today's assignment and has not yet checked in, the page SHALL offer a check-in action that calls `POST /assignments/:id/check-in`, setting `actualStartTime`.

#### Scenario: Employee checks in
- **WHEN** the employee taps/clicks the check-in action for today's shift
- **THEN** the system calls the check-in endpoint for that assignment, and on success the page updates to show "checked in" status with the recorded start time

#### Scenario: Check-in request fails
- **WHEN** the check-in request errors (network/server error)
- **THEN** the page shows an error message and the assignment's status remains "not checked in", so the employee can retry

### Requirement: Check-out action
Once checked in and not yet checked out, the page SHALL offer a check-out action that calls `POST /assignments/:id/check-out`, setting `actualEndTime`. This iteration does not gate checkout on task completion (no backend model for per-shift task completion exists yet).

#### Scenario: Employee checks out
- **WHEN** a checked-in employee taps/clicks the check-out action
- **THEN** the system calls the check-out endpoint for that assignment, and on success the page updates to show "checked out" status with the recorded end time

#### Scenario: Already checked out
- **WHEN** today's assignment already has both `actualStartTime` and `actualEndTime` set
- **THEN** the page shows a "checked out" status and no further check-in/check-out action is offered for that assignment

### Requirement: Multiple shifts today
If the employee has more than one assignment for today (e.g. split shifts, multiple branches), each SHALL be listed with its own independent status and check-in/check-out action.

#### Scenario: Employee has two shifts today
- **WHEN** the employee has two separate assignments both scheduled for today
- **THEN** the page lists both, and checking in/out of one does not affect the other's displayed status

### Requirement: Mandatory and todo tasks are shown read-only
If the employee's current or upcoming shift has associated task templates (`SHARED_MANDATORY`, `SHARED_OPTIONAL`, or `DEDICATED`), the page SHALL list them for reference. The page SHALL NOT block check-out on task completion and SHALL NOT offer a way to mark a task complete or attach evidence, since no backend model tracks per-shift task completion yet.

#### Scenario: Shift has mandatory task templates
- **WHEN** today's shift has one or more `SHARED_MANDATORY` task templates configured for its branch/shift
- **THEN** the page lists their titles, without checkboxes or a completion state

#### Scenario: Shift has no task templates
- **WHEN** today's shift has no associated task templates
- **THEN** the task list section is omitted or shows an empty state, and check-out remains available once checked in
