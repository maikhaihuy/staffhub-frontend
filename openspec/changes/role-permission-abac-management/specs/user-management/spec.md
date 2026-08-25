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

### Requirement: Assigning the Manager role requires at least one managed branch
Managed branches (`ManagerBranch`) scope a Manager's ABAC-conditioned permissions to specific branches, tracked per-user and decoupled from the employee's home branch (`Employee.branchId`/the user's embedded `branches`). WHEN an admin's role selection for a user includes a role flagged `isSystemRole` and named "Manager" (or more generally, any role whose grants resolve conditions using the `$managedBranches` token), the system SHALL require selecting at least one managed branch before the assignment can be saved, and SHALL persist that selection separately from the user's employee branch links.

#### Scenario: Assign Manager role without selecting a managed branch
- **WHEN** an admin adds the Manager role to a user's role selection but selects no managed branch
- **THEN** the system blocks saving with a validation error requiring at least one managed branch

#### Scenario: Assign Manager role with managed branches
- **WHEN** an admin adds the Manager role and selects two managed branches
- **THEN** the system saves the role assignment together with the two managed branch links, independent of the employee's own `branchIds`

#### Scenario: Removing the Manager role clears the requirement
- **WHEN** an admin removes the Manager role from a user who previously had managed branches selected
- **THEN** the system no longer requires a managed branch to save that user's role assignment
