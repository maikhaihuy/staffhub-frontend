## Purpose

Represents a single dated shift instance at a branch, either generated from a master-shift-template or created standalone, and containing one or more sub-shifts.

## ADDED Requirements

### Requirement: Master shift CRUD and date-range listing
The system SHALL create, update, and delete master shifts via `/master-shifts` REST endpoints, and SHALL list them scoped to `branchId` plus an optional `from`/`to` date range via `GET /master-shifts?branchId=<id>&from=<date>&to=<date>`.

#### Scenario: Loading a week's shifts for a branch
- **WHEN** the roster calendar loads a branch for a given week
- **THEN** the system fetches master shifts with `from`/`to` bounding that week only

### Requirement: Master shift can be generated from a template
The system SHALL support generating a master shift (and its sub-shifts/tasks) from a template for a specific date via `POST /master-shifts/generate` with `{masterShiftTemplateId, workDate}`.

#### Scenario: Generating a shift from a template
- **WHEN** the system calls generate with a valid `masterShiftTemplateId` and `workDate`
- **THEN** the backend creates the master shift plus its sub-shifts and returns the full `MasterShift` including nested `subShifts`

### Requirement: Master shift embeds branch, template, and sub-shift data
A master shift response SHALL include `workDate` (date-only), full `startTime`/`endTime` (`DateTime`), `status`, an optional `branch` summary, a nullable `masterShiftTemplate` summary, and an array of `subShifts`.

#### Scenario: Matching a shift to a calendar cell
- **WHEN** the roster calendar looks up which template/day a master shift belongs to
- **THEN** it compares `masterShiftTemplateId` and the date-only form of `workDate` against the grid's template and day, without a separate lookup request

### Requirement: workDate and date comparisons avoid timezone-round-trip corruption
Date-only values (`workDate`) SHALL be compared and formatted using local `Date` component accessors (`getFullYear`/`getMonth`/`getDate`), never via `.toISOString()`, to avoid an off-by-one-day shift near midnight in timezones behind UTC.

#### Scenario: Comparing a shift's workDate to a calendar day near midnight
- **WHEN** the browser's local time is near midnight and a shift's `workDate` is compared to a calendar day
- **THEN** the comparison uses local date components and does not misplace the shift on the adjacent day
