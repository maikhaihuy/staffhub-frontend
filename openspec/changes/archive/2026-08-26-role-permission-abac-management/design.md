## Context

This repo (`berd.em-frontend`) is the Admin Dashboard frontend. Its Prisma/backend layer was already removed (CLAUDE.md: "Backend status: partially mocked... The backend/Prisma layer was removed from this repo"). The wider initiative that motivates this change is a 3-stage plan:

- **Stage 1** (backend, not this repo): row-level scoping data model.
- **Stage 2** (backend, not this repo): server-side condition-token resolution, `resolveUserRules`, updated permission middleware, ability-resolution endpoints.
- **Stage 3** (this repo): the Admin UI — role/permission management, the permission matrix, user-role assignment, a permission simulator, and an audit log.

Today's frontend model is simpler than the target: `User.roleId` is single-valued (`user-management` spec), `src/features/roles` only exposes `GET /roles` (a stub), there is no `permissions` concept, and `AppSidebar`'s role filtering is fed a hardcoded `role="admin"` prop (dead code for real users). This change moves the frontend to the target model for everything Stage 3 owns, and treats Stage 1/2 as an external contract.

**Confirmed against `openapi.json`, most recently re-checked after backend progress** — the actual implementation diverges from the change's original wording in one important way: **row-scoping conditions live on the role↔permission grant, not on the `Permission` definition.** `Permission` stays a plain `{action, subject, description}` catalog entry (`CreatePermissionDto`/`PermissionResponseDto`); the scope lives on `PermissionGrantDto{permissionId, condition?}`, used inside `AssignPermissionsDto{roleId, grants: PermissionGrantDto[]}` (confirmed **additive**: "only the (roleId, permissionId) pairs listed here are affected — the role's other existing grants are left untouched") and returned on `RolePermissionResponseDto.condition`. This is simpler than a permission-row-per-scope model would have been, and this design was updated to match it — see **Decisions**.

Confirmed real and available now:
- `Role`/`Permission` CRUD (`/roles`, `/permissions`), `RolePermissionResponseDto`-based grants (`/role-permissions`).
- `Role.isSystemRole: boolean` — *"True for the seeded base roles (Admin, Manager, Employee); such a role cannot be deleted through the API."*
- `GET /me/abilities` and `GET /users/:id/abilities`, both returning `AbilityRuleDto[]` = `{action, subject, inverted, conditions?}` (`conditions` is the already-resolved condition, post `$self` substitution; `inverted` marks a "cannot" rule — not previously anticipated, worth supporting since it's part of the real contract).
- `GET /audit-logs` with `subject`/`actorId`/`entityId`/`fromDate`/`toDate`/`page`/`limit` filters, returning `AuditLogResponseDto{id, actorId, action, subject, entityId, before, after, createdAt}`.

Confirmed still missing:
- `User.roleIds` — `CreateUserDto`/`UpdateUserDto`/`UserResponseDto` all still have a required scalar `roleId`.
- `ManagerBranch` / the `$managedBranches` condition token — no schema, no endpoint; every documented example of `PermissionGrantDto.condition`/`AbilityRuleDto.conditions` mentions only `$self`.
- `Permission.fields` — never appeared in any schema; consistent with it being out of scope (Non-Goals), so this isn't tracked as a blocker.

See **Backend Dependencies** below for the current required/needed breakdown.

A second employee-facing repo (StaffHub Zalo Mini App) already consumes `GET /me/abilities` to hydrate its own CASL context — this change does not touch that repo; it independently builds the same kind of consumption for the Admin Dashboard's own gating, per **Non-Goals** below.

## Goals / Non-Goals

**Goals:**
- Build the Stage 3 Admin UI: role list (with user/permission counts and system-role delete protection), a permission catalog, a permission matrix with scope selection and confirm-before-save, user-role assignment with a Manager→managed-branch requirement, a permission simulator, and an audit log.
- Consume `GET /me/abilities` in this app the same way the Zalo Mini App already does: hydrate a real `@casl/ability` `Ability` and use it for the admin's own nav/action gating, replacing the hardcoded sidebar role prop.
- Keep existing unconditioned `(action, subject)` checks behaving exactly as before (regression-safe) — a grant with no `condition` is an unconditional grant.

**Non-Goals:**
- Any Stage 1/2 backend work: schema/migrations, `ManagerBranch`, `resolveUserRules`, permission middleware, or the ability-resolution endpoints themselves. This repo has no Prisma layer to migrate.
- Field-level (`fields`) permission enforcement — not implemented backend-side at all; nothing to build against.
- Business-rule logic (e.g. mandatory-task checkout blocking) — a separate state machine, not part of authorization.
- Any change to the Zalo Mini App.
- Server-side/API enforcement guarantees — this UI's gating is UX only; the backend must independently enforce every check, exactly as it already must for today's flat RBAC.

## Decisions

**Adopt `@casl/ability` rather than a custom checker.** The backend's rules are explicitly CASL-shaped (`{action, subject, conditions, inverted}`), and the Zalo Mini App already builds a CASL `Ability` from the same ability-resolution response shape. Using the real library keeps both frontends interpreting the exact same rule semantics instead of re-implementing a subset that could silently diverge.

**Conditions live on the role↔permission grant (`PermissionGrantDto.condition`), not on the `Permission` definition.** *(Corrected from this design's earlier draft, which assumed `conditions` was a column on `Permission` itself and required creating a distinct catalog row per scope.)* Since the real `Permission` entity stays `{action, subject, description}`, the Permission Matrix is simpler than originally designed: a cell = one `(role, permission)` pair; checking it and picking a scope sets `PermissionGrantDto.condition` for that pair directly via `POST /role-permissions`; changing scope re-sends the grant with a different `condition`; unchecking calls `DELETE /role-permissions/role/:roleId/permission/:permissionId`. No upsert-a-new-Permission-row logic needed.

**Known scope presets map to known tokens; anything else is "Custom JSON".** "Own records only" generates a `condition` using `$self` (confirmed supported today). "Managed branches only" would generate a `condition` using `$managedBranches` — **not yet buildable**, since neither `ManagerBranch` nor that token exist backend-side yet (Backend Dependency #2). The preset can be built and left disabled/hidden until the dependency lands. The exact field name each subject uses for `$self` (e.g. `employeeId: "$self"` for one subject vs. a differently-named field for another) is backend-owned; see Backend Dependencies #4. The frontend does not attempt to validate condition semantics beyond well-formed JSON — token support/fail-closed behavior is the backend's guarantee, not re-implemented here.

**`GET /me/abilities` is fetched once per session (login/app load) and rebuilt on user change**, cached the same way other feature queries are (`useAppQuery`, React Query), not on every render. A short-TTL mismatch between an admin's own just-changed permissions and their live session is acceptable since this is UX gating, not the security boundary.

**`inverted` rules are respected even though the original description didn't mention them.** `AbilityRuleDto.inverted` marks a "cannot" rule; since it's part of the real contract CASL's `Ability` natively supports, the frontend passes it straight through when building the `Ability` rather than ignoring it.

**`User.roleId` becomes `User.roleIds`; `ManagerBranch` is keyed per-user, not per-role-assignment** (once the backend ships it). A user's managed branches would apply to any of their roles whose resolved conditions use `$managedBranches`, not to one specific role-assignment.

**Matrix save is per-changed-grant, not a single bulk request.** Since `POST /role-permissions` is additive/upsert-per-pair and removal is a separate `DELETE`, the confirm-before-save step computes the diff between the matrix's loaded and edited state (for the before/after display and affected-user-count), then on confirm issues one `POST /role-permissions` call carrying every added/changed grant plus one `DELETE .../permission/:permissionId` call per removed cell.

## Backend Dependencies

Confirmed against the current `openapi.json`.

**Update (this session): #1 and #2 have shipped.** Re-confirmed against a fresh live `GET /docs-json` fetch and exercised end-to-end against the running backend:
1. ~~`User`↔`Role` changed from scalar `roleId` to `roleIds[]`~~ **Shipped.** `CreateUserDto.roleIds: number[]` (required), `UserResponseDto.roles: {id, name}[]`. Note `UpdateUserDto` has *no* `roleIds` field — role membership changes go through `POST /users/:id/roles` (additive) / `DELETE /users/:id/roles/:roleId` instead, not the base update payload. Both verified live (create, add, remove-blocked-on-last-role).
2. ~~`ManagerBranch` table/endpoints + `$managedBranches` condition-token support~~ **Shipped**, including resolution. `POST /users/:id/manager-branches` / `DELETE /users/:id/manager-branches/:branchId` exist; `$managedBranches` resolves correctly via `GET /users/:id/abilities` when the grant uses `{[field]: {in: "$managedBranches"}}` — verified live with a user holding only the scoped role: unresolved to `{"branchId":{"in":[]}}` with no branches assigned, then `{"branchId":{"in":[1]}}` after assigning one. (An earlier pass through this same verification wrongly concluded resolution was broken — the test itself was flawed: it "reverted" a matrix change via `DELETE .../permission/:id`, which removes the grant rather than restoring it to unconditioned, and its test user held a second role with its own unconditioned grant for the same action+subject, which wins CASL's multi-role OR-of-conditions union regardless of the scoped role's resolved condition. Not a resolution failure.) One real gap remains:
   - **No `GET` endpoint** to read a user's currently-assigned managed branches — the frontend's UI for this is write-only as a result (see tasks.md 6.3).
3. Migration/rollout backward-compatibility (existing grants with no `condition` stay unconditional) — confirmed regression-safe, verified live.

4. ~~Per-subject field-name mapping for the `$self` token~~ **Shipped.** `GET /permissions/catalog` now exists, returning `{subject, actions, conditionTokens: {token, fields}[]}` per subject. One confirmed gap: `attendance-history` has a live seeded `$self` condition (`assignment.is.employeeId`, observed via the simulator) with no matching catalog entry — the frontend keeps a one-entry fallback for this specific case (`condition.ts`'s `SELF_FIELD_FALLBACK`).
5. Fail-closed handling of unknown/unsupported condition tokens server-side (drop rule, log warning) — still unverified from this session; not exercised.

**Already real** (confirmed via live schema + exercised this session): `Role`/`Permission` CRUD, `isSystemRole`, `POST /role-permissions` (additive grants with `condition`, including `$managedBranches`), `GET /role-permissions/role/:roleId`, `DELETE` (all/one), `GET /me/abilities`, `GET /users/:id/abilities` (resolving both `$self` and `$managedBranches`), `GET /audit-logs` (with filters), `GET /permissions/catalog`, `roleIds` on create + role-assignment endpoints, manager-branch write endpoints. Everything Stage 3 needs to build against is now real; the one remaining gap (no read-back for a user's currently-assigned managed branches) is tracked above rather than blocking further UI work.

## Risks / Trade-offs

- **[Risk] Dependencies #1-#2 (multi-role users, `ManagerBranch`) have no committed timeline.** → Mitigation: ship everything else now against real endpoints (role/permission CRUD, matrix minus branch-scoping, ability hydration, simulator, audit log); stub only the multi-role assignment UI and "Managed branches only" preset behind the mock-backed-service pattern (`employee.service.ts`) until they land.
- **[Risk] Per-subject field-name convention for the `$self` preset isn't specified (Dependency #4)**, so the matrix may need a small per-subject metadata table maintained in the frontend rather than deriving it dynamically. → Mitigation: "Custom JSON" remains available for any subject not yet covered by a preset mapping.
- **[Risk] Removing the hardcoded `role="admin"` sidebar prop changes what real (non-admin) staff currently see**, since that filtering was previously inert. → Mitigation: called out here and in the proposal as a behavior fix, not a contract break; verify against real Manager/Employee accounts before merging.
- **[Risk] Client-side ability checks could be mistaken for enforcement.** → Mitigation: explicitly a Non-Goal above; PR description and any inline documentation should restate that the backend enforces independently.

## Migration Plan

1. Build role list/CRUD and permission catalog/CRUD against the real `/roles`, `/permissions` endpoints, including `isSystemRole`-based delete protection — no mocking needed.
2. Add `@casl/ability`; wire `GET /me/abilities` → `Ability` hydration, replace the hardcoded sidebar role prop, validate with one pilot guarded action.
3. Build the Permission Matrix against real `/role-permissions` endpoints for "No restriction"/"Own records only"/"Custom JSON"; leave "Managed branches only" visibly disabled until Dependency #2 ships.
4. Ship the permission simulator (`GET /users/:id/abilities`) and audit log (`GET /audit-logs`) pages — both real today.
5. Once Dependencies #1-#2 land: ship user-role multi-assignment and enable "Managed branches only"; no data migration needed on the frontend since all of this is additive UI.

## Open Questions

- Should the base user-creation form require selecting at least one role inline, or can creation defer entirely to the user detail page's role-assignment step? This design assumes the former for consistency with the existing form-validation pattern.
- Exact UI copy/plain-language phrasing for the Permission Simulator's "why denied" explanations — deferred to implementation/design review, not a blocker.
- Should the frontend surface `AbilityRuleDto.inverted` ("cannot") rules distinctly in the Permission Simulator's plain-language output, or just let `@casl/ability` resolve them silently? Leaning toward surfacing them explicitly since they explain otherwise-confusing denials.
