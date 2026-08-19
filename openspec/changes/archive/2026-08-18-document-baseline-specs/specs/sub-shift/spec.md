## Purpose

Represents a role/slot pool within a master shift (e.g. "Cashier") with its own time window and assignment capacity, that employees are assigned into via assignments.

## ADDED Requirements

### Requirement: Sub-shift CRUD scoped to a master shift
The system SHALL create, update, and delete sub-shifts via `/sub-shifts` REST endpoints. Each sub-shift SHALL require `masterShiftId`, `title`, `type` (`MAIN`/`SUPPORT`), `startTime`, and `endTime`; `subShiftTemplateId`, `maxAssignments`, `status`, and `note` are optional.

#### Scenario: Sub-shift capacity
- **WHEN** `maxAssignments` is set on a sub-shift
- **THEN** the system can compare it against the count of assignments for that sub-shift to show remaining capacity (e.g. "1/3")

### Requirement: One default sub-shift is auto-created per master shift
The frontend SHALL create exactly one default `MAIN` sub-shift per master shift and currently provides no UI for adding a second sub-shift to the same master shift or for picking a different `type`.

#### Scenario: Rendering a master shift's sub-shift
- **WHEN** a calendar cell renders a master shift
- **THEN** it treats `masterShift.subShifts[0]` as "the" sub-shift for that cell

### Requirement: Sub-shift response shape varies by embedding depth
The system SHALL distinguish a "lite" sub-shift (scalar fields only, as embedded inside a `MasterShift.subShifts` array) from a "full" sub-shift (adds nested `masterShift`, `subShiftTemplate`, and `tasks` relations, as returned when fetching a sub-shift directly or by parent).

#### Scenario: Sub-shift embedded in a master shift
- **WHEN** a master shift response includes `subShifts`
- **THEN** each entry has scalar fields only (no nested `masterShift`/`subShiftTemplate`/`tasks`), and the system does not assume those relations are present
