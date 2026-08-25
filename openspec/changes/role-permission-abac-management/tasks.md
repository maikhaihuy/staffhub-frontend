## 1. Foundations

- [x] 1.1 Add `@casl/ability` as a dependency
- [x] 1.2 Add `PERMISSIONS` (`BASE /permissions`, `BY_ID /permissions/:id`), `ROLE_PERMISSIONS` (`/role-permissions`, `/role-permissions/role/:roleId`, `/role-permissions/role/:roleId/permission/:permissionId`), `ME_ABILITIES` (`/me/abilities`), `USER_ABILITIES` (`/users/:id/abilities`), and `AUDIT_LOGS` (`/audit-logs`) to `src/lib/api/endpoints.ts` — all confirmed real per `openapi.json`
- [x] 1.3 Track the two remaining gaps in design.md's Backend Dependencies (`User.roleIds`, `ManagerBranch`/`$managedBranches`) with the backend; update that section as they land

## 2. Roles feature: stub to full CRUD + system-role protection

- [x] 2.1 Extend `src/features/roles/types.ts` with full `Role` fields matching the real `RoleResponseDto` (`id`, `name`, `description`, `isSystemRole`, `permissions[]`, audit fields); add `userCount`/`permissionCount` if/when the backend exposes them, otherwise derive `permissionCount` from `permissions.length`
- [x] 2.2 Add `src/features/roles/schemas/role.schema.ts` (Zod: `name` required, `description` optional, `permissionIds` required per `CreateRoleDto`)
- [x] 2.3 Extend `src/features/roles/services/role.service.ts` with `create`, `update`, `remove`, `getById` against the real `/roles` endpoints
- [x] 2.4 Add `useRoleMutations.ts` alongside existing `useRoleQueries.ts`, using `useAppMutation`'s `invalidateKey`
- [x] 2.5 Add `src/features/roles/components/{list,form}.tsx`; disable/hide delete for rows where `isSystemRole` is `true`

## 3. Permissions catalog feature

- [x] 3.1 Add `src/features/permissions/types/index.ts` matching the real `PermissionResponseDto` (`id`, `action`, `subject`, `description`, `roles[]`, audit fields) — no `conditions`/`fields` on this entity
- [x] 3.2 Add `src/features/permissions/schemas/permission.schema.ts` (Zod: `action`, `subject` required per `CreatePermissionDto`)
- [x] 3.3 Add `src/features/permissions/services/permission.service.ts` (`list`, `create`, `update`, `remove` against real `/permissions`)
- [x] 3.4 Add `src/features/permissions/hooks/{usePermissionQueries,usePermissionMutations}.ts` with `index.ts` re-export

## 4. Permission Matrix UI

- [x] 4.1 Build the action × subject grid component, grouping by subject, sourced from the permission catalog plus `GET /role-permissions/role/:roleId` (the role's current grants, each with an optional `condition`)
- [x] 4.2 Implement 3 of the 4 scope presets now: "No restriction" (no `condition`), "Own records only" (`condition` built from `$self`), "Custom JSON" (admin-entered `condition`); render "Managed branches only" visibly disabled with a tooltip noting it's pending the backend's `ManagerBranch`/`$managedBranches` support
- [x] 4.3 Implement save: for each changed cell, send `POST /role-permissions` with `{roleId, grants: [{permissionId, condition?}]}` for added/changed grants, and `DELETE /role-permissions/role/:roleId/permission/:permissionId` for each removed cell
- [x] 4.4 Build the confirm-before-save dialog: diff of changed cells (before/after scope) plus the role's current assigned-user count; block submission until confirmed
- [x] 4.5 Wire the Role Detail page (`src/app/(dashboard)/roles/[id]/page.tsx`) to load the matrix and call the mutations on confirm
- [ ] 4.6 Confirm with backend the per-subject field-name convention for `$self` (e.g. does `OvertimeRequest` scope on `employeeId`?) so the "Own records only" preset generates correct `condition` JSON per subject — **not implementable from this session**: requires a real conversation with the backend team, not code. Defaulted to `employeeId` (design.md's own worked example) in `src/features/permissions/utils/condition.ts`; "Custom JSON" is the escape hatch until this is confirmed.

## 5. Admin's own CASL ability hydration

- [x] 5.1 Add a CASL layer (e.g. `src/lib/casl/ability.ts`) that builds an `Ability` instance from a `GET /me/abilities` response (`AbilityRuleDto[]` = `{action, subject, inverted, conditions?}`), passing `inverted` through so "cannot" rules are respected
- [x] 5.2 Add a hook (e.g. `useAbility`) that fetches `/me/abilities` on login/app load (via `useAppQuery`, keyed to the current user) and exposes `ability.can(action, subject)`
- [x] 5.3 Replace the hardcoded `role="admin"` prop in `src/app/(dashboard)/layout.tsx` with ability-derived nav filtering in `src/components/app-sidebar.tsx`
- [x] 5.4 Apply one pilot action guard (e.g. branch delete) using `ability.can(...)` to validate the pattern end-to-end
- [x] 5.5 Ensure the ability is rebuilt (not stale) when the logged-in user changes

## 6. User-role multi-assignment + managed branches (blocked on backend: `User.roleIds`, `ManagerBranch`)

- [ ] 6.1 Change `src/features/users` types/schema from `roleId: number` to `roleIds: number[]`; update the create/edit form to a multi-select — requires the backend's `roleIds` change first
- [ ] 6.2 Update user list/detail rendering from singular `roleName` to a `roles: {roleId, roleName}[]` array
- [ ] 6.3 Add managed-branches selection UI on the user detail page, shown when a selected role resolves to Manager-scoped (`$managedBranches`) permissions
- [ ] 6.4 Add client-side validation: block saving if a Manager-scoped role is selected with zero managed branches selected
- [ ] 6.5 Persist managed branches via the `ManagerBranch`-backed endpoint once it exists, independent of the employee's `branchIds`

## 7. Permission Simulator

- [x] 7.1 Add `src/app/(dashboard)/permission-simulator/page.tsx`: user picker + resolved-permissions display in plain language
- [x] 7.2 Add the service call for `GET /users/:id/abilities` (real endpoint)
- [x] 7.3 Add the "debug a specific check" flow: action + subject (+ optional resource attributes) → pass/fail with reason (no matching rule, condition not met, or an `inverted` rule denying it)

## 8. Audit log

- [x] 8.1 Add `src/app/(dashboard)/audit-log/page.tsx`: entry list with actor, action+subject, before/after, timestamp, sourced from `GET /audit-logs`
- [x] 8.2 Add `subject`/`actorId`/date-range filters and `page`/`limit` pagination, matching the real query parameters (`entityId` filter omitted from the UI — no natural entry point to type an arbitrary entity id without more context; the filter param is still supported end-to-end in `AuditLogFilter`/the service call)
- [x] 8.3 Add the service/hook layer for `GET /audit-logs`

## 9. Verification

- [ ] 9.1 Manually verify each scenario in `specs/role-permission-management/spec.md`, `specs/permission-simulator/spec.md`, `specs/permission-audit-log/spec.md` against the running app (`pnpm dev`); the `user-management` delta's scenarios stay unverifiable until backend Dependencies #1-#2 land — **not done from this session**: the backend at `localhost:3094` (per `.env.local`) is unreachable from this sandbox (separate peer session/environment), so login and all live data flows can't be exercised here. `pnpm build`'s webpack compile step passed for every new route/component (RSC boundaries, imports); `pnpm exec tsc --noEmit` and `pnpm lint` are both clean for all new/changed files. Needs a real run against a live backend before merging.
- [ ] 9.2 Verify a real (non-admin) logged-in user's sidebar now reflects their actual resolved abilities instead of the previous hardcoded admin view — same blocker as 9.1
- [ ] 9.3 Verify an unconditioned `(action, subject)` grant still grants access exactly as before, and that an `inverted` rule correctly denies (regression + new-behavior check per acceptance criteria) — same blocker as 9.1
- [x] 9.4 Run `pnpm lint` and fix any violations introduced by the new feature modules
