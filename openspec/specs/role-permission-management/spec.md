# role-permission-management Specification

## Purpose

Provides CRUD for roles and the permission catalog, plus a permission matrix for assigning scoped (ABAC) grants to roles, and hydrates the admin's own CASL ability for nav/action gating.

## Requirements

### Requirement: Roles are managed with system-role delete protection
The system SHALL create, list, update, and delete roles via `/roles` REST endpoints, with `name` required and `description` optional. Each role SHALL carry an `isSystemRole` flag identifying the three default roles (Owner/Admin, Manager, Employee). The system SHALL prevent deleting any role where `isSystemRole` is `true`; only its permission grants may be edited.

#### Scenario: Create a custom role
- **WHEN** an admin submits the role form with a `name` filled in
- **THEN** the system sends `POST /roles` and, on success, shows a success toast and invalidates the roles list

#### Scenario: Attempt to delete a default system role
- **WHEN** an admin views the "Manager" role, where `isSystemRole` is `true`
- **THEN** the delete action is disabled and no `DELETE` request is sent

#### Scenario: Delete a custom role
- **WHEN** an admin deletes a role where `isSystemRole` is `false`
- **THEN** the system sends `DELETE /roles/:id` and removes it from the list on success

### Requirement: Role list shows user count and permission count
The role list SHALL display, for each role, the number of users currently assigned that role and the number of permissions granted to it, sourced from the roles list response.

#### Scenario: Viewing the role list
- **WHEN** the role list renders
- **THEN** each row shows the role's assigned-user count and granted-permission count without extra per-row requests

### Requirement: Permissions are CASL-shaped action+subject definitions
Permission entities SHALL be modeled as `{action, subject, description?}` and managed via `/permissions` REST endpoints (`GET`/`POST /permissions`, `GET`/`PATCH`/`DELETE /permissions/:id`). Row-level scoping is not a property of the permission definition itself — it lives on the role's grant of that permission (see the Permission Matrix requirement below).

#### Scenario: Create a permission
- **WHEN** an admin submits the permission form with `action` and `subject` filled in
- **THEN** the system sends `POST /permissions` and, on success, shows a success toast and invalidates the permissions list

### Requirement: Permission Matrix assigns scoped grants per role
The Role Detail screen SHALL render an action × subject grid, one cell per `(role, permission)` pair. Each cell reflects whether the role currently holds a grant for that permission, and its scope (derived from the grant's `condition`). Checking a cell SHALL require picking one of: "No restriction" (no `condition`), "Own records only" (`condition` built from the `$self` token), "Managed branches only" (`condition` built from the `$managedBranches` token), or "Custom JSON" (admin-entered `condition` object). "Own records only" and "Managed branches only" are only offered when `GET /permissions/catalog` confirms the row's subject supports that token; otherwise the option is disabled. On save, the system SHALL create or update the role's grant for that permission via `POST /role-permissions` with the resulting `condition`; unchecking a cell SHALL remove the grant via `DELETE /role-permissions/role/:roleId/permission/:permissionId`.

#### Scenario: Grant a permission with no restriction
- **WHEN** an admin checks the "approve OvertimeRequest" cell for the Manager role and selects "No restriction"
- **THEN** the system sends `POST /role-permissions` with a grant for that `(roleId, permissionId)` pair and no `condition`

#### Scenario: Grant a permission scoped to the actor's own records
- **WHEN** an admin checks a cell and selects "Own records only"
- **THEN** the system sends `POST /role-permissions` with a grant whose `condition` is built from the `$self` token for that subject

#### Scenario: Change the scope of an already-granted permission
- **WHEN** an admin changes the "approve OvertimeRequest" cell for the Manager role from "Own records only" to "No restriction"
- **THEN** the system re-sends the grant for that `(roleId, permissionId)` pair via `POST /role-permissions` with no `condition`, updating the existing grant rather than creating a duplicate

#### Scenario: Uncheck a granted cell
- **WHEN** an admin unchecks a previously-granted cell
- **THEN** the system sends `DELETE /role-permissions/role/:roleId/permission/:permissionId` for that pair

### Requirement: Saving permission changes requires an affected-user-count confirmation
Before persisting any change to a role's permission grants, the system SHALL show a confirmation step summarizing the before/after state of every changed cell and the number of users currently holding that role, and SHALL submit the change only after explicit confirmation.

#### Scenario: Save with confirmation
- **WHEN** an admin edits the permission matrix for a role with 12 assigned users and clicks Save
- **THEN** the system shows a confirmation dialog listing the changed cells and "12 users affected" before sending any request

#### Scenario: Cancel at confirmation
- **WHEN** an admin dismisses the confirmation dialog instead of confirming
- **THEN** no request is sent and the matrix keeps the unsaved edits for further changes

### Requirement: Admin UI resolves and applies its own CASL abilities
On login and app load, the system SHALL fetch the authenticated admin's resolved rules via `GET /me/abilities` (each rule shaped `{action, subject, inverted, conditions?}`), build a CASL `Ability` instance from them using `@casl/ability`, and use `ability.can(action, subject)` to gate admin navigation and actions — replacing the previously hardcoded `role="admin"` prop passed to the sidebar.

#### Scenario: Nav item hidden without a matching ability
- **WHEN** the admin's resolved rules include no rule for subject `"branches"` (the real backend's permission-catalog subject name)
- **THEN** the sidebar does not render a link to the branches section

#### Scenario: Existing unconditioned rules keep working
- **WHEN** a resolved rule has no `conditions`
- **THEN** `ability.can(action, subject)` evaluates as an unconditional grant, matching pre-ABAC behavior (regression-safe)

#### Scenario: Inverted rule denies an otherwise-granted action
- **WHEN** the admin's resolved rules include an `inverted: true` rule for a given action+subject
- **THEN** `ability.can(action, subject)` evaluates to `false` for that action+subject, even if an earlier non-inverted rule would have granted it

#### Scenario: Ability rebuilt after login
- **WHEN** a different user logs in
- **THEN** the system re-fetches `GET /me/abilities` and rebuilds the `Ability` instance rather than reusing the previous user's rules
