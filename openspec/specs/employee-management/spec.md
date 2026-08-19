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
