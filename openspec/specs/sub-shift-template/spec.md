# sub-shift-template Specification

## Purpose

Represents a MAIN/SUPPORT staffing slot inside a master shift template (e.g. "Main #1", "Support") - the structural blueprint that dated `sub-shift` instances are later generated from, mirroring how `master-shift-template` relates to `master-shift`.

## Requirements

### Requirement: Sub-shift template CRUD scoped to a master shift template
The system SHALL create, list, update, and delete sub-shift templates via `/sub-shift-templates` REST endpoints. Each sub-shift template SHALL require `branchId`, `masterShiftTemplateId`, `name`, `type` (`MAIN`/`SUPPORT`), `startTime`, and `endTime`; `maxAssignments`, `sortOrder`, `status` (`DRAFT`/`ACTIVE`/`INACTIVE`/`ARCHIVED`), and `note` are optional. Sub-shift templates SHALL be displayed as cards in the master template's detail page's Sub Shifts section, and added or edited via a Dialog (not a Drawer).

#### Scenario: Adding a sub-shift template from the detail page
- **WHEN** an admin adds a sub-shift template from the "Add Sub Shift" action on a master shift template's detail page
- **THEN** the system sends `POST /sub-shift-templates` with the current `masterShiftTemplateId` and the entered fields, and a new card appears in the detail page's Sub Shifts section on success

#### Scenario: Removing a sub-shift template
- **WHEN** an admin confirms removal of a sub-shift template from its card's overflow menu on the detail page
- **THEN** the system sends `DELETE /sub-shift-templates/:id` and removes its card from the Sub Shifts section on success

### Requirement: MAIN sub-shift templates cannot overlap within the same master shift template
Before saving, the system SHALL reject a `MAIN` sub-shift template whose `startTime`-`endTime` range overlaps any other `MAIN` sub-shift template belonging to the same `masterShiftTemplateId`.

#### Scenario: Adding an overlapping MAIN slot
- **WHEN** an admin adds or edits a `MAIN` sub-shift template whose time range overlaps an existing `MAIN` sub-shift template on the same master template
- **THEN** the system blocks the save and shows an inline validation error identifying the conflicting slot

#### Scenario: Non-overlapping MAIN slots
- **WHEN** an admin adds "Main #1: 08:00-12:00" and "Main #2: 12:00-16:00" to the same master template
- **THEN** both are saved, since their ranges are adjacent, not overlapping

### Requirement: Sub-shift templates must fall within their master template's time range
Before saving, the system SHALL reject a sub-shift template whose `startTime`-`endTime` range is not fully contained within its master shift template's `startTime`-`endTime` range.

#### Scenario: Sub-shift starts before the master template opens
- **WHEN** an admin adds or edits a sub-shift template whose `startTime` is earlier than its master template's `startTime`
- **THEN** the system blocks the save and shows an inline validation error stating the sub-shift must be within the template's hours

#### Scenario: Sub-shift ends after the master template closes
- **WHEN** an admin adds or edits a sub-shift template whose `endTime` is later than its master template's `endTime`
- **THEN** the system blocks the save and shows an inline validation error stating the sub-shift must be within the template's hours

#### Scenario: Sub-shift exactly spans the master template's range
- **WHEN** an admin adds a sub-shift template whose `startTime` equals the master template's `startTime` and whose `endTime` equals the master template's `endTime`
- **THEN** the save succeeds, since the range is fully contained (inclusive of the boundary)

### Requirement: Sub-shift template time and type errors are independent of the MAIN-overlap check
When a candidate sub-shift template fails both the bounding check and the MAIN-overlap check, the system SHALL report the bounding error, since a sub-shift outside its own template's hours is invalid regardless of any sibling overlap.

#### Scenario: A MAIN sub-shift is both out of bounds and overlapping
- **WHEN** an admin enters a `MAIN` sub-shift template that is both outside the master template's range and overlapping an existing `MAIN` sibling
- **THEN** the system shows the out-of-bounds error, not the overlap error

### Requirement: SUPPORT sub-shift templates may overlap MAIN or other SUPPORT sub-shift templates
The system SHALL NOT apply the MAIN overlap restriction to `SUPPORT` sub-shift templates; a `SUPPORT` sub-shift template's time range may freely overlap any `MAIN` or `SUPPORT` sub-shift template on the same master template.

#### Scenario: Support slot spanning two MAIN slots
- **WHEN** an admin adds a `SUPPORT` sub-shift template "10:00-16:00" to a master template that already has "Main #1: 08:00-12:00" and "Main #2: 12:00-16:00"
- **THEN** the save succeeds despite the time overlap with both MAIN slots

### Requirement: Sub-shift template start/end times are timezone-free wall-clock values
`startTime`/`endTime` SHALL be interpreted and re-serialized as timezone-independent wall-clock times (`HH:mm`), never round-tripped through local-timezone `Date` parsing or `.toISOString()`, matching the same rule already applied to master shift templates.

#### Scenario: Displaying a sub-shift template's hours
- **WHEN** a sub-shift template with `startTime` 10:00 and `endTime` 16:00 is rendered
- **THEN** the UI shows "10:00 - 16:00" regardless of the browser's local timezone
