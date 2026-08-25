## Context

An admin RBAC UI (permission matrix, a permission simulator, an audit trail
view) is being built against this API. Investigation of the current backend
surfaced four concrete gaps, detailed in the proposal:

1. `PATCH /roles/:id` accepts `permissionIds` (`update-role.dto.ts`) and
   `role.service.ts:150-159` writes `permissions: { set: [...] } }` into the
   Prisma update — `Role` has no `permissions` relation, only
   `rolePermissions`, so this throws at runtime. The composite-key
   construction also reuses the `.map((id) => ...)` callback's `id` (a
   permission id) for both `roleId` and `permissionId`. `role-permissions.*`
   is the only working way to manage grants today.
2. `RolePermission.condition` can only be set by `prisma/seed.ts` —
   `AssignPermissionsDto` and `RolePermissionsService.assignPermissions`
   never read or write it.
3. `CaslAbilityFactory.createForUser()` is only ever invoked inside
   `PermissionsGuard` for the currently authenticated caller
   (`JwtAccessStrategy.validate`); nothing lets an admin ask "what can user
   X do?"
4. The subject → `$self` field-name convention
   (`time-logs`→`employeeId`, `leave-requests`→`absenceEmployeeId`,
   `attendance-history`→`assignment.is.employeeId`, etc.) exists only as
   implicit knowledge in `prisma/seed.ts`.
5. No audit trail exists beyond the per-row `createdBy`/`updatedBy` scalar
   columns already on every mutable model.

## Goals / Non-Goals

**Goals:**
- Make `role-permissions` conditions settable through the API.
- Remove the broken, unused `PATCH /roles/:id` write path cleanly (400, not
  a 500 from an unhandled Prisma error).
- Let an admin inspect any user's effective, resolved abilities.
- Publish the subject→field-name convention as data, not tribal knowledge.
- Record who changed what on audited entities, and expose it as a list.

**Non-Goals:**
- Branch-level (`$managedBranches`) or any other new condition-scope
  concept — out of scope per `CLAUDE.md` and the `authorization` spec; only
  `$self` conditions exist today and this change doesn't add new ones.
- A generic Prisma-level audit-everything interceptor covering every model
  in one shot — start with the mutable, permission-guarded entities already
  enumerated in `prisma/seed.ts`'s subject list; new subjects opt in the
  same way new modules already register permissions.
- Reworking `CaslAbilityFactory` itself — the abilities endpoint reuses it
  unchanged.

## Decisions

### 1. Fix `PATCH /roles/:id` by deleting the broken field, not repairing it
`UpdateRoleDto` drops `permissionIds` entirely; `RoleService.update` drops
the `permissions: { set: ... } }` block. Because `ValidationPipe` is
configured with `forbidNonWhitelisted: true` (`exception.module.ts`), any
caller still sending `permissionIds` gets a clean 400 from the pipe instead
of reaching the service and throwing a Prisma error. This is simpler and
safer than fixing the composite-key bug and wiring it to a real relation,
since `role-permissions` already owns this responsibility correctly
(transactional upsert, existence checks) — duplicating it on `roles` would
just recreate the "two ways to do the same thing" problem that caused the
bug. **BREAKING** for the (already-broken) field, not for any working
client.

### 2. `condition` on `AssignPermissionsDto` is per-permission-id, optional, unvalidated JSON
`AssignPermissionsDto.permissionIds: number[]` becomes
`grants: { permissionId: number; condition?: Record<string, unknown> }[]`
(or `permissionIds` kept for the no-condition case — final shape decided in
tasks). `condition` is passed straight to
`RolePermission.upsert({ update: { condition }, create: { ...,
condition } })`, matching how `Permission.condition` is already typed as
`Json?` with no schema validation beyond "valid JSON" (mirroring the
existing seed's approach — `resolveCondition`/`$self` resolution happens at
ability-build time, not at write time, so an admin can write a condition
whose keys don't yet resolve for any caller without the write itself
failing). Rejected alternative: validating the condition shape against the
per-subject field catalog at write time — deferred because it would
duplicate the catalog's field list in two places (write-time validator and
the catalog endpoint) for a data model that's still just "partial Prisma
`where` object," and the existing seed data isn't validated this way either.

### 3. Abilities endpoint reuses `JwtAccessStrategy`'s load shape, doesn't duplicate it
`GET /users/:id/abilities` loads the target user with
`userWithRolePermissionsInclude` (same include already exported from
`user.types.ts`), builds the same `{ userId, employeeId, permissions }`
shape `JwtAccessStrategy.validate` builds for the *caller*, and calls
`CaslAbilityFactory.createForUser()` on it. The response serializes the
built `Ability`'s rules (`ability.rules`) as `{ action, subject, inverted,
conditions }[]` rather than re-deriving them from raw `RolePermission` rows,
so the endpoint reports what the caller would *actually* get (post
`$self`-resolution against the target user's identity), catching the same
"unresolvable `$self`" case `PermissionsGuard` would hit. Gated by a new
`read`/`user-abilities` permission (own `(action, subject)` pair, not
folded into `read:users`) so it can be granted narrowly to whoever builds
admin tooling without also granting general user read/write.

### 4. Catalog endpoint serves a static config module, not a schema/DB query
The subject→field-name map moves out of being implicit in
`prisma/seed.ts` into a small exported const (e.g.
`src/modules/permissions/subject-condition-fields.ts`), which `prisma/seed.ts`
imports and uses when constructing conditions, and which
`GET /permissions/catalog` serializes directly. This keeps a single source
of truth (the const) without adding a database round-trip or a new table
for what is currently fixed, code-level knowledge. Rejected alternative:
deriving the catalog from existing `condition` JSON already seeded into
`RolePermission` rows — rejected because a subject with no seeded
conditioned grant yet (or a fresh, unseeded environment) would have no
catalog entry, which is exactly the drift this endpoint exists to prevent.

### 5. Audit log is written explicitly in service methods, not via Prisma middleware
Each audited service's existing mutation methods (already the sole write
path per module convention) make one additional
`this.auditLogService.record({ actorId, action, subject, entityId, before,
after })` call after a successful Prisma write, inside the same
`$transaction` where one is already used (e.g. employees' hourly-rate sync)
or as a best-effort follow-up write otherwise. Rejected alternative: a
Prisma Client `$extends`/middleware hook that intercepts every `create`
/`update`/`delete` globally — rejected because it can't cleanly capture
*actor* (the middleware has no request context) without threading
`AsyncLocalStorage` through the whole app, which is a much bigger change
than this proposal's scope; explicit calls also make it obvious, per
module, which subjects are and aren't audited (matching how permission
checks are already explicit per route rather than inferred).
`AuditLog` gets its own `Int` autoincrement id, `actorId Int`, `action
String`, `subject String`, `entityId Int`, `before Json?`, `after Json?`,
`createdAt DateTime @default(now())` — no `updatedBy`/`updatedAt` since rows
are append-only and never mutated, consistent with an audit log's own
nature even though it breaks from this codebase's usual
`createdAt/createdBy/updatedAt/updatedBy` convention on every other mutable
model (there is nothing to update).

## Risks / Trade-offs

- [Removing `permissionIds` from `UpdateRoleDto` breaks any existing caller
  that (perhaps unknowingly, since it always 500'd) sends it] → It already
  errors for every such caller today; turning that into a 400 is strictly a
  behavior improvement, not a new break for any client that currently
  succeeds.
- [Explicit per-service audit calls will be missed on some mutation path as
  new code is added, silently under-auditing] → Cover the initial rollout
  with an e2e test per audited module asserting a write produces exactly one
  `AuditLog` row; note in `AGENTS.md`/`CLAUDE.md` that new mutations on
  audited subjects need the same call, the same way `@RequirePermissions`
  is already a manual per-route convention enforced by code review, not a
  compiler check.
- [`condition` accepted as unvalidated JSON on `POST /role-permissions`] →
  Bounded blast radius: an admin-only route already gated by
  `update:role-permissions`, and a malformed condition only affects rows
  visible under that one grant (same failure mode as a bad seed entry
  today, per the "Unresolvable `$self` token denies the request"
  authorization requirement — the caller gets `403`, not corrupted data).
- [New `AuditLog` table adds write latency to every audited mutation] →
  Each write is a single indexed insert on a dedicated table, not a
  cross-table transaction beyond the one already wrapping the mutation
  itself; acceptable for admin-facing write volume in this system.

## Migration Plan

1. Ship the `PATCH /roles/:id` fix and `role-permissions` `condition`
   support together (small, additive to one module pair).
2. Add a Prisma migration for `AuditLog` (`pnpm db:dev --name
   add-audit-log`), the `audit-logs` module, and wire the explicit
   `record()` calls into the mutation methods of the modules already listed
   as row-scoped subjects in the `authorization` spec
   (`time-logs`, `leave-requests`, `assignments`, `payroll-entries`,
   `availability`, `attendance-history`) plus `roles`/`permissions`/
   `role-permissions`/`users` (the RBAC subjects themselves).
3. Add the abilities and catalog endpoints last — they're pure reads with
   no data-model change, and the catalog endpoint benefits from the
   subject-condition-fields const already existing from step 1/2's seed
   usage.
4. No rollback data concerns: steps 1 and 3 are additive/non-destructive;
   step 2's migration only adds a new table, so `db:deploy` rollback is a
   drop-table migration if ever needed.

## Open Questions

- Exact request/response shape for `AssignPermissionsDto`'s `condition`
  field (per-id array vs. keeping the flat `permissionIds` array for the
  common no-condition case and adding a separate endpoint/field for
  conditioned assignment) — left for `tasks.md` to pin down against
  existing frontend expectations.
- Whether `GET /audit-logs` needs cursor pagination to match other list
  endpoints' conventions in this codebase, or offset-based is acceptable
  given expected volume — resolve during implementation by checking the
  nearest existing paginated list endpoint's convention.
