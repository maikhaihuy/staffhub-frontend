# assignment Specification

## Purpose

Tracks which employee is assigned to which sub-shift, its scheduling status, and the employee's actual clock-in/clock-out times.

## Requirements

### Requirement: Assignment CRUD and lookup by sub-shift or employee
The system SHALL create, update, and delete assignments via `/assignments` REST endpoints, and SHALL support listing assignments filtered by `subShiftId` (`listBySubShift`) or by `employeeId` (`listByEmployee`). Each assignment SHALL require `employeeId` and `subShiftId`; `availabilityId`, `assignedAt`, `status`, and `note` are optional.

#### Scenario: Loading assignments for a calendar cell
- **WHEN** a roster calendar cell needs the employees assigned to a sub-shift
- **THEN** the system fetches via `listBySubShift(subShiftId)`, sharing its query-cache key with any parent aggregate query for the same sub-shift so the data is fetched once

### Requirement: Assignment status follows a fixed lifecycle
An assignment's `status` SHALL be one of `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, or `ABSENT`.

#### Scenario: New assignment created without explicit status
- **WHEN** an assignment is created without a `status`
- **THEN** the system treats it as the backend's default status until check-in/check-out or another explicit update changes it

### Requirement: Check-in and check-out set actual times independently of scheduling
The system SHALL support recording actual attendance via `POST /assignments/:id/check-in` (`actualStartTime`) and `POST /assignments/:id/check-out` (`actualEndTime`), separately from the assignment's scheduled sub-shift window. Both `actualStartTime` and `actualEndTime` SHALL be nullable until recorded.

#### Scenario: Assignment not yet checked in
- **WHEN** an assignment has no `actualStartTime`/`actualEndTime`
- **THEN** the UI shows the assignment's `status` badge instead of a time range

#### Scenario: Actual time differs from the sub-shift's scheduled window
- **WHEN** both `actualStartTime` and `actualEndTime` are set and differ (by wall-clock time) from the sub-shift's `startTime`/`endTime`
- **THEN** the UI visually flags the assignment as having an adjusted time

### Requirement: Assignment response embeds employee and sub-shift summaries
An assignment response SHALL include an `employee` summary (`id`, `fullName`, `phoneNumber`) and a `subShift` summary (`id`, `title`, `startTime`, `endTime`, nested `masterShift` summary), so consumers can render an assignment without extra lookups.

#### Scenario: Rendering an assignment in a calendar cell
- **WHEN** an assignment is rendered
- **THEN** the employee's name comes from `assignment.employee.fullName`, not from a separate employee-id lookup
