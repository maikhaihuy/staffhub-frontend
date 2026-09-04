## ADDED Requirements

### Requirement: Profile navigation entry
The system SHALL provide a "Cá nhân" navigation entry, reachable at `/profile`, visible to every
authenticated user regardless of role, listed alongside the other general navigation sections
(not gated by any permission check).

#### Scenario: Any authenticated role sees the entry
- **WHEN** a signed-in user (Staff, Manager, or Admin) views the app navigation (sidebar or
  mobile bottom nav)
- **THEN** a "Cá nhân" entry is present and navigates to `/profile`

#### Scenario: Breadcrumb reflects the profile page
- **WHEN** a user is on `/profile`
- **THEN** the breadcrumb shows "Cá nhân" without requiring page-specific breadcrumb code

### Requirement: View own personal information
The system SHALL let a signed-in user view their own name, phone number, role, and branch
assignment(s) on the `/profile` page, sourced from their own account/employee data — no other
user's data SHALL be reachable from this screen.

#### Scenario: Linked account views profile
- **WHEN** a signed-in user whose account is linked to an Employee record opens `/profile`
- **THEN** the page displays their full name, phone number, role, and the name(s) of their
  assigned branch(es)

#### Scenario: Account not linked to an Employee record
- **WHEN** a signed-in user whose account has no linked Employee record opens `/profile`
- **THEN** the page still displays the account-level fields available (phone, role) and shows an
  explanatory empty state in place of the employee-specific section, instead of erroring or
  showing a blank screen

### Requirement: Self-update contact information
The system SHALL let a signed-in user update their own contact-type fields (phone number, email,
address) from `/profile`. The system SHALL NOT let a user edit their own full name, role, branch
assignment(s), or hourly rate from this screen.

#### Scenario: Successful self-update
- **WHEN** a signed-in user with a linked Employee record submits changes to their phone number,
  email, and/or address on `/profile`
- **THEN** the changes are persisted and reflected on the page after saving

#### Scenario: Restricted fields are not editable
- **WHEN** a signed-in user views the edit form on `/profile`
- **THEN** full name, role, branch assignment(s), and hourly rate are not presented as editable
  fields in that form

#### Scenario: Validation failure surfaces inline
- **WHEN** a signed-in user submits the self-update form with invalid data (e.g. malformed email)
- **THEN** the form shows an inline validation error and does not submit the request

### Requirement: Voluntary password change
The system SHALL let a signed-in user change their own password from `/profile` at any time, not
only when a password change is forced by the backend.

#### Scenario: User changes password voluntarily
- **WHEN** a signed-in user (with `mustChangePassword` false) enters their current password and a
  matching new password/confirmation on `/profile`
- **THEN** the password is updated and the user remains on `/profile` (not redirected to the
  standalone forced-change-password screen)

#### Scenario: Current password mismatch
- **WHEN** a signed-in user submits the password-change form on `/profile` with an incorrect
  current password
- **THEN** the system shows an error and does not change the password

### Requirement: Logout from profile
The system SHALL let a signed-in user log out directly from `/profile`, in addition to any
existing logout entry point elsewhere in the app.

#### Scenario: User logs out from the profile screen
- **WHEN** a signed-in user selects the logout action on `/profile`
- **THEN** the user's session is ended and they are redirected to the login screen
