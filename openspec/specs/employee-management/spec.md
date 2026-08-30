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
When an Employee is created, the backend auto-provisions a matching login account whose default
password is the employee's phone number (see `staffhub-backend`'s
`employee-user-auto-provisioning` capability). The system SHALL, on successful `POST /employees`,
notify the Admin that a login account was created and what its default password is, so this isn't
discovered only when the new employee asks how to log in.

#### Scenario: Employee created successfully
- **WHEN** an Admin's `POST /employees` succeeds
- **THEN** the system shows a notice stating that a login account was created and that its
  default password is the employee's phone number, in addition to the existing
  employee-created confirmation

#### Scenario: Phone number collides with an existing account
- **WHEN** `POST /employees` fails because a `User` with that phone number already exists
- **THEN** the system surfaces that specific error on the phone number field rather than a
  generic failure notice
