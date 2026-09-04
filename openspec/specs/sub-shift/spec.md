# sub-shift Specification

## Purpose

Represents a role/slot pool within a master shift (e.g. "Cashier") with its own time window and assignment capacity, that employees are assigned into via assignments.

## Requirements

### Requirement: Sub-shift CRUD scoped to a master shift
The system SHALL create, update, and delete sub-shifts via `/sub-shifts` REST endpoints. Each sub-shift SHALL require `masterShiftId`, `title`, `type` (`MAIN`/`SUPPORT`), `startTime`, and `endTime`; `subShiftTemplateId`, `maxAssignments`, `status`, and `note` are optional.

#### Scenario: Sub-shift capacity
- **WHEN** `maxAssignments` is set on a sub-shift
- **THEN** the system can compare it against the count of assignments for that sub-shift to show remaining capacity (e.g. "1/3")

### Requirement: All of a master shift's generated sub-shifts are rendered
The frontend SHALL render every sub-shift generated for a master shift, one per the source template's `SubShiftTemplate`s, instead of assuming a single default `MAIN` sub-shift. A master shift with multiple generated sub-shifts (e.g. two `MAIN` slots plus a `SUPPORT` slot) SHALL show all of them in its calendar cell.

#### Scenario: Rendering a master shift's sub-shifts
- **WHEN** a calendar cell renders a master shift with more than one sub-shift
- **THEN** it lists every entry in `masterShift.subShifts`, not just `masterShift.subShifts[0]`

#### Scenario: Rendering a master shift with a single sub-shift
- **WHEN** a calendar cell renders a master shift with exactly one sub-shift
- **THEN** it shows that one sub-shift, preserving prior single-sub-shift behavior

### Requirement: Sub-shift response shape varies by embedding depth
The system SHALL distinguish a "lite" sub-shift (scalar fields only, as embedded inside a `MasterShift.subShifts` array) from a "full" sub-shift (adds nested `masterShift`, `subShiftTemplate`, and `tasks` relations, as returned when fetching a sub-shift directly or by parent).

#### Scenario: Sub-shift embedded in a master shift
- **WHEN** a master shift response includes `subShifts`
- **THEN** each entry has scalar fields only (no nested `masterShift`/`subShiftTemplate`/`tasks`), and the system does not assume those relations are present
