## Why

Today's authorization model is flat RBAC with no row-level scoping: a user has exactly one `roleId`, `src/features/roles` is a read-only stub, there is no permissions concept, and the sidebar's role filtering is fed a hardcoded `role="admin"` prop rather than the real user. The product needs row-level (ABAC) scoping — e.g. a Manager should only approve overtime/delivery receipts for the branches they manage, not every branch — on top of RBAC. The backend now exposes a CASL-compatible ability model (`GET /me/abilities`, `GET /users/:id/abilities`, and `condition`-scoped role↔permission grants); this change builds the Admin Dashboard UI to manage that model and to consume it for the admin app's own gating.

**Repo scope note**: this repo (`berd.em-frontend`) is the Admin Dashboard frontend and its Prisma/backend layer was already removed (see CLAUDE.md). This change covers the Admin UI plus this frontend's consumption of the backend's ability/audit endpoints; anything not yet exposed by the backend is tracked as an explicit dependency in design.md rather than built here.

**Backend status (re-confirmed against `openapi.json`)**: most of what this change needs is now real — role/permission CRUD, `isSystemRole`-flagged system roles, `condition`-scoped role↔permission grants (`POST /role-permissions`, confirmed additive), `GET /me/abilities`, `GET /users/:id/abilities`, and `GET /audit-logs`. Two things remain unbuilt: multi-role users (`User.roleId` is still a single required scalar) and branch-scoped grants (`ManagerBranch`/the `$managedBranches` condition token don't exist yet). See design.md's **Backend Dependencies** for the full breakdown — this proposal's scope reflects that split.

## What Changes

- Extend `src/features/roles` (currently a list-only stub) into full role management: CRUD, using the real `isSystemRole` flag for delete protection on the three seeded default roles.
- Add a new `permissions` feature module modeling permissions as plain `{action, subject, description?}` catalog entries via `/permissions` — no scoping data on the permission definition itself.
- Add a Role Detail / Permission Matrix screen: action × subject grid, one cell per `(role, permission)` pair; checking a cell requires picking a scope ("No restriction" / "Own records only" / "Managed branches only" — disabled until the backend supports it / "Custom JSON"), which sets a `condition` on that role's grant of the permission via `POST /role-permissions` (confirmed additive/upsert-per-pair) rather than on the permission definition.
- Require an explicit confirm step (showing before/after changed cells and affected-user count) before any permission-matrix save is submitted.
- Adopt `@casl/ability` as a new dependency: fetch the admin's own resolved rules via `GET /me/abilities` on login/app load, build a real CASL `Ability` (including `inverted` "cannot" rules), and use `ability.can(action, subject)` for admin nav/action gating, replacing the hardcoded `role="admin"` sidebar prop. Unconditioned rules continue to behave exactly as today's flat RBAC (regression-safe).
- Add a Permission Preview / Simulator page: pick a user, see their resolved effective permissions (via `GET /users/:id/abilities`) in plain language, and debug a specific denied action+subject check.
- Add an audit log page backed by `GET /audit-logs`, filterable by subject, actor, entity, and date range.
- **BREAKING, blocked on backend**: extend `user-management`'s user↔role relationship from a single `roleId` to multiple `roleIds`, and add a User-Role Assignment UI (multi-select on a user's detail page) with a Manager→managed-branch requirement. Not implementable until the backend ships multi-role users and `ManagerBranch`; see design.md's Migration Plan for how this is sequenced behind the rest.

## Capabilities

### New Capabilities
- `role-permission-management`: role CRUD with system-role delete protection, the permission catalog, the permission-matrix UI (grant-level scope, confirm-before-save), and the admin app's own `@casl/ability` hydration from `GET /me/abilities`.
- `permission-simulator`: pick any user, view their resolved effective permissions (via `GET /users/:id/abilities`) in plain language, and debug why a specific action+subject check would pass or fail.
- `permission-audit-log`: browse `GET /audit-logs`, filterable by subject/actor/entity/date.

### Modified Capabilities
- `user-management`: a user's role relationship changes from a single required `roleId` to one-or-more `roleIds`; user responses embed a `roles` array instead of a singular `roleName`; assigning the Manager role requires at least one managed branch, tracked separately from the user's employee branch links. **Blocked on backend** (see Backend Dependencies in design.md) — implemented last, once the backend ships multi-role users and `ManagerBranch`.

## Impact

- **New**: `src/features/permissions/*`, `src/lib/casl/` (or similar — `Ability` builder + `useAbility` hook wrapping `@casl/ability`), `src/app/(dashboard)/roles/page.tsx` (+ `[id]` detail/matrix route), `src/app/(dashboard)/permissions/page.tsx`, `src/app/(dashboard)/permission-simulator/page.tsx`, `src/app/(dashboard)/audit-log/page.tsx`.
- **Extended**: `src/features/roles/*` (stub → full CRUD + `isSystemRole`), `src/features/users/*` (`roleId` → `roleIds` once the backend supports it, managed-branches UI on the user detail page), `src/lib/api/endpoints.ts` (`PERMISSIONS`, `ROLE_PERMISSIONS`, `ME_ABILITIES`, `USER_ABILITIES`, `AUDIT_LOGS`), `src/app/(dashboard)/layout.tsx` and `src/components/app-sidebar.tsx` (real ability-based gating).
- **New dependency**: `@casl/ability`.
- **Backend dependency remaining (not built in this repo)**: multi-role users (`User.roleIds`) and `ManagerBranch`/`$managedBranches` grant scoping. Everything else this change needs is already real. See design.md's **Backend Dependencies** section.
