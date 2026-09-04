## ADDED Requirements

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
