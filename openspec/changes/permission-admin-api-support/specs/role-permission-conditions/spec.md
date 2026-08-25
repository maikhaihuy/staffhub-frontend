## ADDED Requirements

### Requirement: Role-permission grants accept a condition via the API
The system SHALL allow `POST /role-permissions` to set an optional
`condition` (a partial Prisma `where` object, `$self`-token-bearing, same
shape as seeded by `prisma/seed.ts`) on each granted `RolePermission` row, in
addition to creating/refreshing the `(roleId, permissionId)` link. Omitting
`condition` for a given grant SHALL leave that grant unconditioned, matching
today's behavior.

#### Scenario: Assigning a permission with a condition
- **GIVEN** an `Admin` calls `POST /role-permissions` for role `Employee` and
  permission `read`/`time-logs` with `condition: { "employeeId": "$self" }`
- **WHEN** the request completes
- **THEN** the resulting `RolePermission` row has `condition: { "employeeId":
  "$self" }`, and `GET /role-permissions/role/:roleId` returns that
  condition for the grant.

#### Scenario: Assigning a permission without a condition is unchanged
- **GIVEN** an `Admin` calls `POST /role-permissions` for a permission with
  no `condition` supplied
- **WHEN** the request completes
- **THEN** the resulting `RolePermission` row has `condition: null`, matching
  pre-change behavior.

#### Scenario: Re-assigning updates an existing grant's condition
- **GIVEN** a role already holds a `RolePermission` for a given permission
  with `condition: { "employeeId": "$self" }`
- **WHEN** `POST /role-permissions` is called again for the same
  `(roleId, permissionId)` with no `condition` (or a different one)
- **THEN** the existing row's `condition` is updated to the newly supplied
  value (`null` if omitted), not left at its previous value — the upsert
  overwrites `condition` the same way it already overwrites/refreshes the
  link itself.

### Requirement: `PATCH /roles/:id` no longer accepts `permissionIds`
The system SHALL NOT accept a `permissionIds` field on `PATCH /roles/:id`.
`role-permissions` endpoints (`POST /role-permissions`,
`DELETE /role-permissions/role/:roleId/permission/:permissionId`,
`DELETE /role-permissions/role/:roleId`) SHALL remain the only supported way
to manage a role's permission grants.

#### Scenario: Supplying permissionIds on role update is rejected
- **GIVEN** the global `ValidationPipe` is configured with
  `forbidNonWhitelisted: true`
- **WHEN** a client calls `PATCH /roles/:id` with a `permissionIds` field in
  the body
- **THEN** the system responds `400 Bad Request` (the field is rejected by
  validation) rather than reaching `RoleService.update` and throwing a
  Prisma runtime error.

#### Scenario: Updating a role's other fields still works
- **GIVEN** a client calls `PATCH /roles/:id` with only `name`/`description`
  fields
- **WHEN** the request completes
- **THEN** the role's fields are updated and the response reflects them,
  unaffected by the removal of `permissionIds`.
