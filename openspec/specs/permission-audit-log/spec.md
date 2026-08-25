# permission-audit-log Specification

## Purpose

Provides a searchable, filterable record of role, permission, and permission-grant changes so admins can audit who changed what access and when.

## Requirements

### Requirement: Audit log page lists role/permission/grant changes
Role, permission, and permission-grant changes are recorded server-side and exposed via `GET /audit-logs`, returning entries shaped `{id, actorId, action, subject, entityId, before, after, createdAt}`, newest first. The system SHALL provide a UI listing these entries, showing the actor, a human-readable description of the change (`action` + `subject`), the before/after values, and the timestamp.

#### Scenario: Viewing the audit log
- **WHEN** the audit log page loads
- **THEN** the system fetches `GET /audit-logs` and renders entries newest first, showing actor, action+subject, and timestamp per row

#### Scenario: Inspecting a single entry's before/after
- **WHEN** an admin expands an audit log entry
- **THEN** the system shows the entry's `before` and `after` values

### Requirement: Audit log is filterable
The audit log UI SHALL support filtering entries by `subject`, `actorId`, `entityId`, and a `fromDate`/`toDate` range, matching `GET /audit-logs`'s query parameters, and SHALL paginate results using its `page`/`limit` parameters.

#### Scenario: Filter by actor and date range
- **WHEN** an admin filters the audit log to a specific actor and a one-week date range
- **THEN** the system calls `GET /audit-logs` with `actorId`, `fromDate`, and `toDate` set accordingly, and only matching entries are shown

#### Scenario: No filters applied
- **WHEN** the audit log page loads with no filters set
- **THEN** the system calls `GET /audit-logs` with no filter parameters and shows the most recent page of entries across all actors and dates
