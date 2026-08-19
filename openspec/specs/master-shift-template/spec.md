# master-shift-template Specification

## Purpose

Defines a recurring, per-branch shift definition (e.g. "Morning Shift", 08:00-16:00) that dated `master-shift` instances can later be generated from.

## Requirements

### Requirement: Master shift template CRUD scoped to a branch
The system SHALL create, list (by `branchId`), update, and delete master shift templates via `/master-shift-templates` REST endpoints. Each template SHALL require `branchId`, `name`, `startTime`, and `endTime`; `abbreviation`, `status` (`DRAFT`/`ACTIVE`/`INACTIVE`/`ARCHIVED`), and `note` are optional.

#### Scenario: Listing templates for a branch
- **WHEN** the admin selects a branch on the shift-types management page
- **THEN** the system fetches only that branch's templates via `GET /master-shift-templates?branchId=<id>`

#### Scenario: Delete a template
- **WHEN** an admin confirms deletion
- **THEN** the system sends `DELETE /master-shift-templates/:id` and removes it from the list on success

### Requirement: Template start/end times are timezone-free wall-clock values
`startTime`/`endTime` SHALL be interpreted and re-serialized as timezone-independent wall-clock times (`HH:mm`), never round-tripped through local-timezone `Date` parsing or `.toISOString()`, since IANA timezone data can have historical UTC-offset differences from the current offset (e.g. `Asia/Ho_Chi_Minh` pre-1975) that would otherwise corrupt the displayed time.

#### Scenario: Displaying a template's hours
- **WHEN** a template with `startTime` 08:00 and `endTime` 16:00 is rendered
- **THEN** the UI shows "08:00 - 16:00" regardless of the browser's local timezone
