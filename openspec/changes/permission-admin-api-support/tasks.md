## 1. Fix the broken `PATCH /roles/:id` write path

- [ ] 1.1 Remove `permissionIds` from `src/modules/roles/dto/update-role.dto.ts`.
- [ ] 1.2 Remove the `permissions: { set: ... } }` block and the now-unused
      `permissionIds` verification logic from `RoleService.update`
      (`src/modules/roles/role.service.ts`).
- [ ] 1.3 Update/add a unit test in `role.service.spec.ts` asserting a
      `permissionIds` field in the update payload is stripped/rejected
      rather than reaching Prisma.
- [ ] 1.4 Add/update an e2e case asserting `PATCH /roles/:id` with a
      `permissionIds` body returns `400`, and with only `name`/`description`
      still succeeds.

## 2. Add `condition` support to role-permission assignment

- [ ] 2.1 Update `AssignPermissionsDto`
      (`src/modules/role-permissions/dto/assign-permission.dto.ts`) so each
      permission id can carry an optional `condition` (resolve the
      per-id-array vs. flat-array shape noted as an open question in
      `design.md`, matching whatever the frontend matrix UI expects).
- [ ] 2.2 Update `RolePermissionResponseDto`
      (`src/modules/role-permissions/dto/role-permission-response.dto.ts`)
      to include `condition`.
- [ ] 2.3 Update `role-permissions.types.ts`'s include/select and
      `RolePermissionMapper.toDto(s)` to surface `condition`.
- [ ] 2.4 Update `RolePermissionsService.assignPermissions` to pass
      `condition` into both the `create` and `update` branches of the
      `rolePermission.upsert` call (overwriting on re-assignment per the
      spec's "Re-assigning updates an existing grant's condition"
      scenario).
- [ ] 2.5 Update/add unit tests in `role-permissions.service.spec.ts`
      covering: assigning with a condition, assigning without one,
      re-assigning to change/clear a condition.
- [ ] 2.6 Update/add e2e coverage for the assign → list → condition
      round-trip.

## 3. Audit log data model

- [ ] 3.1 Add an `AuditLog` model to `prisma/schema.prisma`: `id Int
      @id @default(autoincrement())`, `actorId Int`, `action String`,
      `subject String`, `entityId Int`, `before Json?`, `after Json?`,
      `createdAt DateTime @default(now())`, with an index on `(subject,
      createdAt)` and on `actorId` to support the list endpoint's filters.
- [ ] 3.2 Run `pnpm db:dev --name add-audit-log` to generate and apply the
      migration.
- [ ] 3.3 Scaffold `src/modules/audit-logs/` (module, service, controller,
      mapper, types, DTOs) following the reference module structure in
      `src/modules/employees/`.
- [ ] 3.4 Register `AuditLogsModule` in `src/app.module.ts`.

## 4. Wire audit recording into mutation services

- [ ] 4.1 Add an `AuditLogService.record({ actorId, action, subject,
      entityId, before, after })` method (plain insert, no business logic).
- [ ] 4.2 Add `record()` calls to the create/update/delete methods of the
      row-scoped subjects (`time-logs`, `leave-requests`, `assignments`,
      `payroll-entries`, `availability`, `attendance-history`) — inside the
      existing `$transaction` where one already wraps the write, otherwise
      as an immediately-following call.
- [ ] 4.3 Add the same `record()` calls to the RBAC/admin subjects'
      mutation methods (`users`, `roles`, `permissions`, `role-permissions`).
- [ ] 4.4 Add unit tests per touched service asserting a successful mutation
      calls `AuditLogService.record` with the expected `action`/`subject`,
      and a failed/rejected mutation does not call it.

## 5. Audit log list endpoint

- [ ] 5.1 Implement `GET /audit-logs` with `subject`, `actorId`, `entityId`,
      and `createdAt` range query params, newest-first ordering, and
      pagination (check the nearest existing paginated list endpoint's
      convention per `design.md`'s open question and match it).
- [ ] 5.2 Add a `read`/`audit-logs` permission row and seed it onto `Admin`
      only, in `prisma/seed.ts`.
- [ ] 5.3 Guard the controller with `@RequirePermissions({ action: 'read',
      subject: 'audit-logs' })`.
- [ ] 5.4 Add unit tests for filtering (by subject, by actor) and pagination
      ordering.
- [ ] 5.5 Add e2e coverage: a non-admin request 403s; an admin request
      returns seeded/generated rows in the expected order.

## 6. Admin-scoped abilities endpoint

- [ ] 6.1 Add a `read`/`user-abilities` permission row in `prisma/seed.ts`,
      seeded onto `Admin` only.
- [ ] 6.2 Implement `GET /users/:id/abilities` (in `src/modules/users/` or a
      small dedicated controller) that loads the target user via
      `userWithRolePermissionsInclude`, builds the same `{ userId,
      employeeId, permissions }` shape `JwtAccessStrategy.validate` builds,
      and calls `CaslAbilityFactory.createForUser()`.
- [ ] 6.3 Serialize the built `Ability`'s rules to `{ action, subject,
      condition }[]`, handling the case where a rule's condition can't be
      resolved (target user missing the identity field the condition needs)
      without throwing — per the spec's "unresolvable condition is reported,
      not 500'd" scenario.
- [ ] 6.4 Guard the endpoint with `@RequirePermissions({ action: 'read',
      subject: 'user-abilities' })`.
- [ ] 6.5 Add unit tests: conditioned grant resolves against the target
      user's identity; unconditioned grant passes through unchanged;
      unresolvable condition doesn't throw.
- [ ] 6.6 Add e2e coverage: non-admin caller 403s; admin caller gets the
      expected resolved rule set for a known seeded user.

## 7. Permission catalog endpoint

- [ ] 7.1 Extract the subject→`$self`-field-name mapping currently implicit
      in `prisma/seed.ts` into an exported const module (e.g.
      `src/modules/permissions/subject-condition-fields.ts`).
- [ ] 7.2 Update `prisma/seed.ts` to import and use that const when building
      seeded `RolePermission.condition` values, instead of hardcoding field
      names inline.
- [ ] 7.3 Implement `GET /permissions/catalog` on
      `PermissionsController`/`PermissionsService`, serializing the const
      directly (no DB query for the mapping itself).
- [ ] 7.4 Guard it with the existing `@RequirePermissions({ action: 'read',
      subject: 'permissions' })` used by the rest of `PermissionsController`.
- [ ] 7.5 Add a unit test asserting the endpoint returns the known entries
      (`time-logs`→`employeeId`, `leave-requests`→`absenceEmployeeId`,
      `attendance-history`→`assignment.is.employeeId`).

## 8. Docs

- [ ] 8.1 Update `CLAUDE.md`/`AGENTS.md` to note the audit-log call
      convention (new mutations on audited subjects must call
      `AuditLogService.record`), mirroring how `@RequirePermissions` is
      already documented as a manual per-route convention.
