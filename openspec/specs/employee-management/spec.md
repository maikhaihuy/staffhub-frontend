# employee-management Specification

## Purpose

Lets admins manage employee records and which branches each employee belongs to, independent of whether the employee has a linked login account.

## Requirements

### Requirement: Employee CRUD against the real backend
The system SHALL create, list, update, and delete employees via `/employees` REST endpoints, with `fullName`, `phoneNumber`, and at least one `branchIds` entry required on the form.

#### Scenario: Create employee with no branch selected
- **WHEN** an admin submits the employee form with `branchIds` empty
- **THEN** the form SHALL block submission with "At least one branch is required"

#### Scenario: Update employee's branch assignment
- **WHEN** an admin edits an employee and changes `branchIds`
- **THEN** the system sends `PATCH /employees/:id` with the updated set and the employee's branch list reflects the change on success

### Requirement: Employee entity carries fields with no form UI yet
The system SHALL accept and display, but not yet expose an editing UI for, the backend's additional employee fields: `email`, `address`, `avatar`, `dateOfBirth`, `probationStartDate`, `officialStartDate`, and a nullable linked `user` (`{id, fullName}`).

#### Scenario: Employee has no linked user account
- **WHEN** an employee record's `user` field is null
- **THEN** the system renders the employee without error and without assuming a login exists

### Requirement: Employee creation surfaces the auto-provisioned login account
The system SHALL, on successful `POST /employees`, notify the Admin that a matching login account
was auto-provisioned and surface its one-time password for copying, so this isn't discovered only
when the new employee asks how to log in. When an Employee is created, the backend auto-provisions
a matching login account with a backend-generated one-time password, returned exactly once as
`temporaryPassword` on the create response (confirmed live against `staffhub-backend`'s
`employee.service.ts`, which calls `generateOneTimeCredential()` — **not** the employee's phone
number). The password SHALL NOT be derivable from any field the admin entered on the form.

#### Scenario: Employee created successfully
- **WHEN** an Admin's `POST /employees` succeeds and the response includes `temporaryPassword`
- **THEN** the system shows a notice that a login account was created, and displays the
  `temporaryPassword` value in a copyable field so the Admin can relay it to the employee

#### Scenario: Phone number collides with an existing account
- **WHEN** `POST /employees` fails because a `User` with that phone number already exists
- **THEN** the system surfaces that specific error on the phone number field rather than a
  generic failure notice
