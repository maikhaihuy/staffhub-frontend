## Purpose

Lets admins manage platform login accounts (as distinct from employee records) and assign each one a single role that determines its permissions.

## ADDED Requirements

### Requirement: User CRUD against the real backend
The system SHALL create, list, update, and delete users via `/users` REST endpoints. Unlike other entities, updates SHALL use `PUT /users/:id`, not `PATCH`, to match the real backend's `UsersController_update` contract.

#### Scenario: Update a user
- **WHEN** an admin edits a user's fields and saves
- **THEN** the system sends `PUT /users/:id` (not `PATCH`)

#### Scenario: Create user with duplicate phone number
- **WHEN** an admin submits a user form with a `phoneNumber` already in use
- **THEN** the backend rejects the request and the system surfaces the error via toast without creating a record

### Requirement: Every user has exactly one role
The user form SHALL require `roleId`, sourced from `GET /roles`, and SHALL require `fullName`, `phoneNumber`, and `status` (`ACTIVE`/`INACTIVE`). `avatarUrl` is optional and, if provided, SHALL be a valid URL.

#### Scenario: Role dropdown is populated
- **WHEN** the user form loads
- **THEN** it fetches available roles via `GET /roles` and requires one to be selected before submission

### Requirement: User responses embed role name and branch links
The system SHALL treat a returned user as optionally including `roleName` and a `branches` array of `{branchId, branchName, isPrimary}`, reflecting which branch(es) the user's linked employee (if any) belongs to.

#### Scenario: Displaying a user row
- **WHEN** the user list renders a row
- **THEN** it can show the role name and primary branch directly from the embedded fields without extra requests
