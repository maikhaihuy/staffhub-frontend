## ADDED Requirements

### Requirement: Sub-shift template CRUD scoped to a master shift template
The system SHALL create, list, update, and delete sub-shift templates via `/sub-shift-templates` REST endpoints. Each sub-shift template SHALL require `branchId`, `masterShiftTemplateId`, `name`, `type` (`MAIN`/`SUPPORT`), `startTime`, and `endTime`; `maxAssignments`, `sortOrder`, `status` (`DRAFT`/`ACTIVE`/`INACTIVE`/`ARCHIVED`), and `note` are optional.

#### Scenario: Adding a sub-shift template from the template edit drawer
- **WHEN** an admin adds a sub-shift template while editing a master shift template
- **THEN** the system sends `POST /sub-shift-templates` with the current `masterShiftTemplateId` and the entered fields, and the new row appears in the drawer's sub-shift-template list on success

#### Scenario: Removing a sub-shift template
- **WHEN** an admin confirms removal of a sub-shift template from the drawer
- **THEN** the system sends `DELETE /sub-shift-templates/:id` and removes it from the list on success

### Requirement: MAIN sub-shift templates cannot overlap within the same master shift template
Before saving, the system SHALL reject a `MAIN` sub-shift template whose `startTime`-`endTime` range overlaps any other `MAIN` sub-shift template belonging to the same `masterShiftTemplateId`.

#### Scenario: Adding an overlapping MAIN slot
- **WHEN** an admin adds or edits a `MAIN` sub-shift template whose time range overlaps an existing `MAIN` sub-shift template on the same master template
- **THEN** the system blocks the save and shows an inline validation error identifying the conflicting slot

#### Scenario: Non-overlapping MAIN slots
- **WHEN** an admin adds "Main #1: 08:00-12:00" and "Main #2: 12:00-16:00" to the same master template
- **THEN** both are saved, since their ranges are adjacent, not overlapping

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
