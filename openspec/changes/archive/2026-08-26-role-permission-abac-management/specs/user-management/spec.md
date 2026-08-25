## MODIFIED Requirements

### Requirement: Every user has one or more roles
The user form SHALL require at least one role, selected via `roleIds` sourced from `GET /roles`, and SHALL require `fullName`, `phoneNumber`, and `status` (`ACTIVE`/`INACTIVE`). `avatarUrl` is optional and, if provided, SHALL be a valid URL. This replaces the prior single-`roleId` constraint with a many-to-many `User`↔`Role` relationship, matching the backend's RBAC+ABAC model.

#### Scenario: Role picker is populated
- **WHEN** the user form loads
- **THEN** it fetches available roles via `GET /roles` and requires at least one to be selected before submission

#### Scenario: Assign multiple roles to a user
- **WHEN** an admin selects two roles for a user on the user's detail page and saves
- **THEN** the system persists both role assignments, and subsequent permission checks for that user reflect the union of both roles' grants

### Requirement: User responses embed role names and branch links
The system SHALL treat a returned user as optionally including a `roles` array of `{roleId, roleName}` (replacing the prior singular `roleName` field) and a `branches` array of `{branchId, branchName, isPrimary}`, reflecting which branch(es) the user's linked employee (if any) belongs to.

#### Scenario: Displaying a user row
- **WHEN** the user list renders a row
- **THEN** it can show all assigned role names and the primary branch directly from the embedded fields without extra requests

## ADDED Requirements

### Requirement: Managed branches can be assigned when a role resolves to Manager-scoped permissions
Managed branches (`ManagerBranch`) scope a role's ABAC-conditioned permissions to specific branches, tracked per-user and decoupled from the employee's home branch (`Employee.branchId`/the user's embedded `branches`). WHEN any of a user's selected roles resolves a grant's condition using the `$managedBranches` token (checked against the roles' real grants, not by role name), the system SHALL show a managed-branches selection UI on save, and SHALL persist newly-checked branches separately from the user's employee branch links via `POST /users/:id/manager-branches`.

The backend has no endpoint to read a user's currently-assigned managed branches, so this UI cannot show what is already assigned - it is additive-only (branches checked in a given save are added on top of whatever is already assigned, never replacing it) and does not block saving when a Manager-scoped role is selected with none newly checked, since that could incorrectly block an admin who already has managed branches assigned from a prior session and isn't touching that section in the current edit. Saving with **zero roles selected at all** is blocked client-side, independent of this requirement.

#### Scenario: Assign a Manager-scoped role and select managed branches
- **WHEN** an admin adds a role whose grants resolve to `$managedBranches` and checks two branches in the managed-branches section, then saves
- **THEN** the system persists the role assignment and calls `POST /users/:id/manager-branches` with the two checked branch ids, independent of the employee's own `branchIds`

#### Scenario: Managed-branches section only appears for a Manager-scoped role
- **WHEN** none of a user's selected roles resolves any grant using `$managedBranches`
- **THEN** the managed-branches section is not shown
