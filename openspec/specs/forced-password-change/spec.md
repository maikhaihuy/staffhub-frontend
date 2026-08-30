# forced-password-change Specification

## Purpose

Confine a session the backend has flagged as requiring a password change to a dedicated
change-password screen until it successfully resolves that, so a system-derived default password
(e.g. an auto-provisioned Employee account) is never left standing unnoticed.

## Requirements

### Requirement: A forced-password-change signal redirects to the change-password screen
The system SHALL detect, in the shared axios response interceptor, a `403` response that
distinctly identifies a required password change (as opposed to an ordinary permission-denied
`403`), and SHALL broadcast a client-side event when it does, mirroring how an unrecoverable `401`
already broadcasts `auth:session-expired`. A listener SHALL navigate to `/change-password`,
carrying the current path so the user can return to it once the password is changed, unless the
browser is already on `/change-password` (no redirect needed).

#### Scenario: An API call is rejected for a required password change
- **WHEN** any authenticated request returns a `403` distinctly identifying a required password
  change
- **THEN** the system navigates to `/change-password`, carrying the current path (pathname,
  query, and hash) so the user returns to it after changing their password

#### Scenario: Already on the change-password screen
- **WHEN** the forced-password-change signal is received while the browser is already on
  `/change-password`
- **THEN** the system does not navigate again or wrap the current URL in its own `returnUrl`

### Requirement: `/change-password` requires an authenticated session like any other protected route
`/change-password` SHALL NOT be a public path: an unauthenticated request to it SHALL be
redirected to `/login` the same way any other non-public route is. Any authenticated session
(whether or not it is currently required to change its password) SHALL be able to reach it.

#### Scenario: Anonymous request to /change-password
- **WHEN** a request with no valid session targets `/change-password`
- **THEN** the response redirects to `/login?returnUrl=%2Fchange-password`

#### Scenario: Authenticated user not currently required to change their password
- **WHEN** an authenticated user (not currently flagged) navigates to `/change-password` directly
- **THEN** the page loads normally; the change-password form works the same regardless of why the
  user got there

### Requirement: Change-password form
The system SHALL provide a form at `/change-password` for current password, new password, and
new password confirmation, and SHALL submit `{currentPassword, newPassword}` to
`POST /auth/change-password` — the client-only confirmation field SHALL NOT be sent to the
backend. On success, the system SHALL navigate to the path captured when the user was redirected
here (or `/` if none was captured), and the previously blocked API calls SHALL succeed on their
next attempt.

#### Scenario: Successful password change
- **WHEN** a user submits their correct current password and a valid new password (matching its
  confirmation) at `/change-password`
- **THEN** the system calls `POST /auth/change-password` with `{currentPassword, newPassword}`
  only, and on success navigates to the captured return path (or `/`)

#### Scenario: New password and confirmation don't match
- **WHEN** a user submits a new password whose confirmation field doesn't match it
- **THEN** the form blocks submission with a validation message, without calling the backend

#### Scenario: Backend rejects the current password
- **WHEN** `POST /auth/change-password` fails because the submitted current password is wrong
- **THEN** the system shows the backend's error on the form and does not navigate away
