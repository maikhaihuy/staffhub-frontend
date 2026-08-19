## Purpose

Lets admins manage the set of physical branches (name, abbreviation, address, contact info) that all other scheduling entities (employees, shift templates, shifts) are scoped to.

## ADDED Requirements

### Requirement: Branch CRUD against the real backend
The system SHALL create, list, update, and delete branches via `/branches` REST endpoints (`GET`/`POST /branches`, `GET`/`PATCH`/`DELETE /branches/:id`), with `name`, `abbreviation`, and `address` required and `phone`/`email` optional.

#### Scenario: Create branch with valid data
- **WHEN** an admin submits the branch form with name, abbreviation, and address filled in
- **THEN** the system sends `POST /branches` and, on success, shows a success toast and invalidates the branches list

#### Scenario: Create branch with missing required field
- **WHEN** name, abbreviation, or address is empty
- **THEN** the form SHALL block submission with a validation error before any request is sent

#### Scenario: Delete branch
- **WHEN** an admin confirms deletion of a branch
- **THEN** the system sends `DELETE /branches/:id` and removes it from the list on success

### Requirement: Branch responses embed audit and employee-count fields
The system SHALL treat every branch returned by the backend as including `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, and an optional `employees` array of `{id, fullName}`, in addition to the editable fields.

#### Scenario: Rendering a branch list
- **WHEN** the branch list is displayed
- **THEN** each row can show its linked employee count from the embedded `employees` array without an extra request
