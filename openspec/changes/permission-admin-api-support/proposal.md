## Why

A frontend RBAC admin UI (permission matrix, a "who can do what" simulator,
and an audit trail view) is being built against this backend, and an
investigation of the current API surface turned up real gaps: a broken write
path on `PATCH /roles/:id`, no way to set a role-permission grant's `$self`
condition outside `prisma/seed.ts`, no endpoint to introspect an arbitrary
user's effective abilities, no catalog of the `$self`-condition field-name
convention per subject, and no audit log at all. Building the admin UI
requires closing these gaps first.

## What Changes

- **BREAKING**: Remove the `permissionIds` field from `UpdateRoleDto` /
  `PATCH /roles/:id`. It currently writes `permissions: { set: ... } }` into
  the Prisma update — `Role` has no `permissions` relation (only
  `rolePermissions`), so this throws a Prisma runtime error on any caller that
  supplies it today; removing it makes that failure a clean 400 instead of a
  500, and the `role-permissions` endpoints remain the sole supported way to
  manage a role's grants.
- Add an optional `condition` field to `AssignPermissionsDto` (per
  `permissionId`) and to `RolePermissionResponseDto`, and pass it through in
  `RolePermissionsService`'s upsert, so a role's grant of a permission can
  have its `$self` scope set/updated via `POST /role-permissions` instead of
  only via seed data.
- Add an admin-scoped ability-introspection endpoint
  (`GET /users/:id/abilities`) that loads the target user's role/permissions
  the same way `JwtAccessStrategy` does, builds an `Ability` via
  `CaslAbilityFactory`, and serializes the resulting granted `(action,
  subject, condition)` rules — for the frontend's permission simulator.
- Add a permission catalog endpoint (`GET /permissions/catalog` or similar)
  exposing, per subject, the `$self`-condition field-name convention
  (`employeeId`, `absenceEmployeeId`, `assignment.is.employeeId`, etc.)
  currently hardcoded only in `prisma/seed.ts`, so the frontend has one
  source of truth instead of duplicating the mapping.
- Add an audit log capability: an append-only `AuditLog` model capturing
  actor, action, subject, entity id, and a diff/snapshot, written
  automatically on mutations to audited entities, plus a paginated/filterable
  `GET /audit-logs` list endpoint.

## Capabilities

### New Capabilities
- `role-permission-conditions`: role-permission grants support a `condition`
  field settable through the API, and `PATCH /roles/:id` no longer accepts
  (or silently mishandles) `permissionIds`.
- `permission-introspection`: admin-scoped effective-abilities lookup for an
  arbitrary user, plus a read-only catalog of the `$self` field-name
  convention per subject.
- `audit-log`: an append-only audit trail recorded on mutations, exposed via
  a paginated/filterable list endpoint.

### Modified Capabilities
(none — the changes above are additive API surface; no existing spec's
requirements change)

## Impact

- `src/modules/roles/dto/update-role.dto.ts`, `src/modules/roles/role.service.ts`
  (remove the broken `permissionIds` handling).
- `src/modules/role-permissions/dto/*.ts`, `role-permissions.service.ts`,
  `role-permissions.controller.ts`, `role-permissions.types.ts` (add
  `condition` passthrough).
- `src/modules/casl/casl-ability.factory.ts` (reused, not modified) plus a
  new controller surface (new module or an addition to `users`/`permissions`)
  for the abilities-lookup and catalog endpoints.
- `prisma/schema.prisma` (+ a new migration) for the `AuditLog` model; a new
  `src/modules/audit-logs/` module; `src/app.module.ts` registration; a
  write-path hook triggered from mutating services (design.md decides the
  mechanism — e.g. Prisma middleware/extension vs. explicit service calls).
- `prisma/seed.ts` unaffected — it remains a valid way to seed conditions,
  now joined by the API path.
