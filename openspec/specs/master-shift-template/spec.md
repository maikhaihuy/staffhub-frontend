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

### Requirement: Template edit surface composes nested sub-shift templates
The master shift template create/edit surface SHALL let an admin add, edit, and remove that template's `SubShiftTemplate`s (via the `sub-shift-template` capability) without leaving the template's edit surface.

#### Scenario: Editing a template's sub-shift templates inline
- **WHEN** an admin opens a master shift template for editing
- **THEN** the edit surface shows the template's current sub-shift templates alongside the master fields, and adding, editing, or removing one does not navigate away from the template

### Requirement: Template edit surface shows a proportional visual timeline of its sub-shifts
The master shift template edit surface SHALL render a visual timeline showing the master template's own time range as a reference row, plus one row per sub-shift template (MAIN slots first ordered by `startTime`, then SUPPORT slots ordered by `startTime`), each positioned and sized proportionally to its time range within the master's range.

#### Scenario: Timeline reflects the current sub-shift list
- **WHEN** a master shift template has "Main #1" 08:00-12:00, "Main #2" 12:00-16:00, and "Support" 10:00-16:00, inside a template ranging 08:00-16:00
- **THEN** the timeline renders four rows (the master, then Main #1, Main #2, Support) with each sub-shift bar's horizontal position and width proportional to its time range against the 08:00-16:00 master span

#### Scenario: Timeline updates after adding a sub-shift
- **WHEN** an admin adds a new sub-shift template while the edit surface is open
- **THEN** the timeline shows a new row for it without requiring the admin to close and reopen the template

#### Scenario: Timeline with no sub-shifts yet
- **WHEN** a master shift template has zero sub-shift templates
- **THEN** the timeline shows only the master row, with a hint that adding a sub-shift will show it there

### Requirement: A template needs at least one sub-shift template to be generation-eligible
A master shift template with zero sub-shift templates SHALL NOT be usable as the source of a `POST /master-shifts/generate` call from the UI.

#### Scenario: Generate action disabled on an empty template
- **WHEN** the Weekly Schedule page offers a Generate action for a template/day cell and that template currently has zero sub-shift templates
- **THEN** the Generate action is disabled, with a hint that the template needs at least one sub-shift template first

### Requirement: Template list surfaces sub-shift-template composition
The Shift Templates list SHALL show, for each template, a summary of its sub-shift-template composition (count by `type`, e.g. "2 MAIN Â· 1 SUPPORT") without requiring the admin to open the edit surface.

#### Scenario: Template with no sub-shift templates yet
- **WHEN** a template has zero sub-shift templates
- **THEN** the list row shows an empty/warning composition indicator instead of a count

### Requirement: Shift Templates list supports duplicating a template
The Shift Templates list SHALL offer a "Duplicate" action per template that opens the create flow pre-filled with that template's basic fields (name suffixed to indicate it's a copy, status reset to `DRAFT`) and, once the new template is saved, replays the source template's sub-shift templates against the new template's id.

#### Scenario: Duplicating a template with sub-shifts
- **WHEN** an admin clicks "Duplicate" on a template that has two MAIN and one SUPPORT sub-shift template, and saves the resulting pre-filled create form
- **THEN** the system creates a new master shift template and then creates three new sub-shift templates against it, matching the source template's names, types, and time ranges

#### Scenario: Duplicate does not copy tasks
- **WHEN** an admin duplicates a template that has task templates attached
- **THEN** the new template is created with no tasks; the admin adds any needed tasks manually

#### Scenario: Partial failure while replaying sub-shifts
- **WHEN** one of the source template's sub-shift templates fails to be created against the new template during duplication
- **THEN** the system shows an error for that one sub-shift, leaves the successfully-copied sub-shift templates in place, and does not roll back the newly created master template

### Requirement: Template edit surface manages a minimal task list
The master shift template create/edit surface SHALL let an admin add, edit, and remove a flat list of tasks (`title`, `type`: `SHARED_MANDATORY`/`SHARED_OPTIONAL`/`DEDICATED`) associated with the template, using the existing `/task-templates` endpoints scoped to the template's `masterShiftTemplateId`. Due dates, per-sub-shift task assignment, and recurrence are out of scope for this list.

#### Scenario: Adding an opening checklist item
- **WHEN** an admin adds a task titled "Open register" with type `SHARED_MANDATORY` to a master shift template
- **THEN** the task is persisted via `/task-templates` and appears in the template's task list
