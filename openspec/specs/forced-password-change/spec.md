# forced-password-change Specification

## Purpose

Confines a user flagged `mustChangePassword` to the change-password screen from the moment they're flagged until they replace their password — checked proactively at login, enforced server-side by `middleware.ts` on every request, and reinforced reactively when the backend's guard rejects an API call — so a freshly-provisioned employee on a temporary password cannot use the app until they change it.

## Requirements

### Requirement: The must-change-password flag reaches the frontend as a token claim
The access token payload SHALL carry a `mustChangePassword` boolean claim, exposed on
`AccessTokenClaims` and surfaced on the derived `AuthUser` object. The system SHALL NOT depend on a
`mustChangePassword` field in the `POST /auth/login` response body, because the current user is
re-derived by decoding the `access_token` cookie on every app load and a response-only field would
not survive a page reload. A token that omits the claim SHALL be treated as not flagged, so that
tokens minted before the backend change are not gated.

#### Scenario: Flagged user's token is decoded
- **WHEN** the system decodes an access token whose payload includes `"mustChangePassword": true`
- **THEN** the derived `AuthUser` has `mustChangePassword` set to `true`

#### Scenario: Token predating the backend change
- **WHEN** the system decodes an access token whose payload has no `mustChangePassword` key
- **THEN** the derived `AuthUser` is treated as not flagged and the user is not gated

#### Scenario: Flag survives a page reload
- **WHEN** a flagged user reloads the page and the system re-derives the user from the
  `access_token` cookie
- **THEN** `mustChangePassword` is still `true`, because it was read from the token rather than from
  a login response held in memory

### Requirement: A flagged user is redirected to the change-password screen at login
On a successful login, the system SHALL inspect the `mustChangePassword` claim before navigating.
When the claim is true, it SHALL navigate to `/change-password` instead of the resolved
`returnUrl`, and SHALL carry the resolved `returnUrl` forward as a `returnUrl` query param on
`/change-password` so the user can be released to their intended destination after changing the
password.

#### Scenario: Flagged user logs in
- **WHEN** a user whose token carries `mustChangePassword: true` logs in successfully with no
  `returnUrl` present
- **THEN** the system navigates to `/change-password` rather than `/`

#### Scenario: Flagged user logs in with a returnUrl
- **WHEN** a flagged user logs in after being bounced from `/schedules/123?date=2026-08-24`
- **THEN** the system navigates to
  `/change-password?returnUrl=%2Fschedules%2F123%3Fdate%3D2026-08-24`

#### Scenario: Unflagged user logs in
- **WHEN** a user whose token does not carry `mustChangePassword: true` logs in successfully
- **THEN** the system navigates to the resolved `returnUrl` or `/` exactly as before

### Requirement: A flagged user is confined to the change-password screen server-side
`middleware.ts` SHALL decode the `access_token` cookie on every matched request and, when the
token's `mustChangePassword` claim is true, redirect any request targeting a path other than
`/change-password` to `/change-password`, carrying the originally requested path and query string
as a `returnUrl` query param. This SHALL apply to direct URL entry, bookmarks, and full page
reloads, none of which run the client-side login path. The middleware SHALL evaluate the existing
missing/expired-token redirect first, so an expired token still sends the user to `/login` rather
than to `/change-password`.

#### Scenario: Flagged user opens a dashboard URL directly
- **WHEN** a request carries a valid `access_token` cookie with `mustChangePassword: true` and
  targets `/employees`
- **THEN** the response redirects to `/change-password?returnUrl=%2Femployees`

#### Scenario: Flagged user is already on the change-password screen
- **WHEN** a flagged user's request targets `/change-password`
- **THEN** the request is allowed through, with no redirect, so the page can render

#### Scenario: Flagged user's token has expired
- **WHEN** a request carries an expired `access_token` cookie whose payload has
  `mustChangePassword: true`
- **THEN** the response redirects to `/login` with a `returnUrl`, not to `/change-password`

#### Scenario: Unflagged user browses normally
- **WHEN** a request carries a valid `access_token` cookie without `mustChangePassword: true`
- **THEN** the middleware applies only its existing rules and does not redirect to
  `/change-password`

### Requirement: A rejected request from the backend guard triggers the same redirect
The axios response interceptor SHALL recognize a `403` response whose body identifies a
`PASSWORD_CHANGE_REQUIRED` condition and SHALL dispatch a client-side `auth:password-change-required`
window event rather than redirecting directly, mirroring the existing `auth:session-expired`
handling. `AuthContext` SHALL listen for that event and navigate to `/change-password`, carrying the
current full path as a `returnUrl`. This path SHALL NOT clear the stored tokens — the session is
valid, only gated. This is a fallback for a session already holding a token minted before the claim
existed; it SHALL remain in place alongside the login and middleware checks.

#### Scenario: Guarded endpoint rejects a flagged user
- **WHEN** an authenticated request returns `403` with a `PASSWORD_CHANGE_REQUIRED` body while the
  user is on `/schedules/123`
- **THEN** the system dispatches `auth:password-change-required` and `AuthContext` navigates to
  `/change-password?returnUrl=%2Fschedules%2F123`, leaving the `access_token` and `refresh_token`
  cookies in place

#### Scenario: Unrelated 403
- **WHEN** an authenticated request returns `403` for an ordinary authorization failure, without the
  `PASSWORD_CHANGE_REQUIRED` discriminator
- **THEN** the interceptor rejects the promise as before and dispatches no event

#### Scenario: Session-expiry handling is unaffected
- **WHEN** an authenticated request returns `401` and cannot be recovered by a refresh
- **THEN** the system still clears tokens and dispatches `auth:session-expired`, unchanged by the
  403 branch

### Requirement: The change-password screen lets a flagged user replace their password
The system SHALL provide a `/change-password` route rendering a form over the existing
`changePasswordSchema` (`currentPassword`, `newPassword`, `confirmPassword`, with `newPassword` at
least 6 characters and matching `confirmPassword`) and submitting via
`authService.changePassword()` to `POST /auth/change-password`. All user-facing copy SHALL be in
Vietnamese, per project convention. The screen SHALL be reachable while the user is flagged and
SHALL NOT offer navigation into the gated app.

#### Scenario: Form rejects a mismatched confirmation
- **WHEN** the user submits a `newPassword` that does not equal `confirmPassword`
- **THEN** the form shows a validation message on the `confirmPassword` field and does not call the
  API

#### Scenario: Form rejects a too-short password
- **WHEN** the user submits a `newPassword` shorter than 6 characters
- **THEN** the form shows a validation message on the `newPassword` field and does not call the API

#### Scenario: Backend rejects the current password
- **WHEN** `POST /auth/change-password` fails because `currentPassword` is wrong
- **THEN** the system surfaces the backend's error message and the user remains on
  `/change-password`, still flagged

### Requirement: A successful password change releases the user
On a successful password change, the system SHALL ensure the session no longer carries the
`mustChangePassword` claim before navigating — by persisting a fresh token pair if the change
response returns one, otherwise by performing a token refresh — and SHALL then navigate to the
`returnUrl` query param when it is a safe same-origin relative path, or `/` otherwise. The system
SHALL NOT navigate into the app while the in-memory user is still flagged, so the middleware cannot
immediately bounce the user back.

#### Scenario: Successful change with a returnUrl
- **WHEN** a flagged user on `/change-password?returnUrl=%2Femployees` successfully changes their
  password
- **THEN** the system refreshes the session so the stored token no longer carries
  `mustChangePassword: true`, and navigates to `/employees`

#### Scenario: Successful change without a returnUrl
- **WHEN** a flagged user successfully changes their password with no `returnUrl` present
- **THEN** the system navigates to `/`

#### Scenario: Successful change with a malicious returnUrl
- **WHEN** a flagged user successfully changes their password and `returnUrl` is an absolute or
  protocol-relative URL (e.g. `https://malicious-site.com` or `//malicious-site.com`)
- **THEN** the system ignores that value and navigates to `/` instead of following it

#### Scenario: Re-entering the gate is not possible after release
- **WHEN** the released user navigates to any dashboard path immediately after the change
- **THEN** the middleware reads the refreshed token, finds no `mustChangePassword: true` claim, and
  allows the request through
