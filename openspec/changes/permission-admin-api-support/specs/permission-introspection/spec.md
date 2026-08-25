## ADDED Requirements

### Requirement: Admin-scoped effective-abilities lookup for a target user
The system SHALL expose `GET /users/:id/abilities`, gated by
`RequirePermissions({ action: 'read', subject: 'user-abilities' })`, which
loads the target user's role and role-permission grants (the same
`userWithRolePermissionsInclude` shape `JwtAccessStrategy` loads for the
caller), builds an `Ability` via `CaslAbilityFactory.createForUser()` using
the target user's own identity for `$self` resolution, and returns the
resulting granted rules as `{ action, subject, condition }[]` — reflecting
what that user would actually be authorized for, not the raw
`RolePermission` rows.

#### Scenario: Looking up an employee's resolved abilities
- **GIVEN** an `Employee` whose role grants `read`/`time-logs` with
  `condition: { "employeeId": "$self" }`, and that employee's `employeeId`
  is `42`
- **WHEN** an admin calls `GET /users/:id/abilities` for that user
- **THEN** the response includes a rule for `read`/`time-logs` with
  `condition: { "employeeId": 42 }` (resolved), not the literal `"$self"`
  token.

#### Scenario: Looking up a manager's unconditioned grant
- **GIVEN** a `Manager` whose role grants an unconditioned `read`/`time-logs`
- **WHEN** an admin calls `GET /users/:id/abilities` for that user
- **THEN** the response includes a rule for `read`/`time-logs` with no
  condition.

#### Scenario: Target user with an unresolvable condition is reported, not 500'd
- **GIVEN** a target `User` with no linked `Employee`, whose role grants a
  permission with `condition: { "employeeId": "$self" }`
- **WHEN** an admin calls `GET /users/:id/abilities` for that user
- **THEN** the system responds without throwing — either omitting that
  unresolvable rule from the result or reporting it as unresolved, but never
  a `500` from an unhandled ability-build failure.

#### Scenario: Non-admin cannot call the endpoint
- **GIVEN** a caller whose role does not grant `read`/`user-abilities`
- **WHEN** the caller calls `GET /users/:id/abilities` for any user
- **THEN** the system responds `403 Forbidden`.

### Requirement: Permission catalog exposes the `$self` field-name convention
The system SHALL expose `GET /permissions/catalog`, gated by
`RequirePermissions({ action: 'read', subject: 'permissions' })`, returning,
for every subject with a defined `$self`-condition field-name convention
(e.g. `time-logs`→`employeeId`, `leave-requests`→`absenceEmployeeId`,
`attendance-history`→`assignment.is.employeeId`), that subject's field path,
sourced from a single exported config module rather than being re-derived
from currently-seeded `RolePermission.condition` data.

#### Scenario: Catalog lists the seeded convention
- **WHEN** a caller with `read`/`permissions` calls `GET /permissions/catalog`
- **THEN** the response includes an entry for `time-logs` with field path
  `employeeId`, an entry for `leave-requests` with field path
  `absenceEmployeeId`, and an entry for `attendance-history` with field path
  `assignment.is.employeeId`.

#### Scenario: Catalog entry exists even with no seeded conditioned grant
- **GIVEN** a subject whose field-name convention is defined in the config
  module but which currently has no `RolePermission` row with a non-null
  `condition` in the database
- **WHEN** a caller calls `GET /permissions/catalog`
- **THEN** that subject's entry is still present in the response (the
  catalog is not derived from existing `condition` data).
